import {
    DISPLAY_NAME_END,
    DISPLAY_NAME_START
} from 'components/flytegraph/ReactFlow/utils';
import { Identifier } from 'models/Common/types';
import { dTypes, dEdge, dNode } from 'models/Graph/types';
import { CompiledNode, ConnectionSet, TaskNode } from 'models/Node/types';
import { CompiledTask, TaskTemplate } from 'models/Task/types';
import {
    CompiledWorkflow,
    CompiledWorkflowClosure,
    WorkflowTemplate
} from 'models/Workflow/types';
/**
 * Returns a DAG from Flyte workflow request data
 * @param context input can be either CompiledWorkflow or CompiledNode
 * @returns Display name
 */
export const transformerWorkflowToDAG = (
    workflow: CompiledWorkflowClosure
): dNode => {
    console.log('\n\n\n\n@transformerWorkflowToDAG => INPUT:', workflow);
    const { primary } = workflow;
    const root = buildDAG(null, primary, dTypes.primary, workflow);
    console.log('@transformerWorkflowToDAG => OUTPUT:', root);
    console.log('\n\n\n\n');
    return root;
};

/**
 * Returns a display name from either workflows or nodes
 * @param context input can be either CompiledWorkflow or CompiledNode
 * @returns Display name
 */
export const getDisplayName = (
    context: CompiledWorkflow | CompiledNode
): string => {
    let fullName;
    if (context.metadata) {
        // Compiled Node with Meta
        fullName = context.metadata.name;
    } else if (context.id) {
        // Compiled Node (start/end)
        fullName = context.id;
    } else {
        // CompiledWorkflow
        fullName = context.template.id.name;
    }
    if (fullName == 'start-node') {
        return DISPLAY_NAME_START;
    } else if (fullName == 'end-node') {
        return DISPLAY_NAME_END;
    } else if (fullName.indexOf('.') > 0) {
        return fullName.substr(
            fullName.lastIndexOf('.') + 1,
            fullName.length - 1
        );
    } else {
        return fullName;
    }
};

/**
 * Will return the id for either CompiledWorkflow or CompiledNode
 * @param context   will find id for this entity
 * @returns id
 */
export const getId = (context: CompiledWorkflow | CompiledNode): string => {
    if (context.template) {
        return context.template.id.name;
    } else {
        return context.id;
    }
};

/**
 * @TODO deprecate this function (use createDNode)
 * @param context: graph entity to be wrapped in dNode
 */
export const buildDNode = (context: any, type: dTypes): dNode => {
    const output = {
        id: getId(context),
        value: context,
        type: type,
        name: getDisplayName(context),
        nodes: [],
        edges: []
    } as dNode;
    return output;
};

export const checkStartEndType = (node: CompiledNode): dTypes => {
    switch (node.id) {
        case 'start-node':
            return dTypes.start;
        case 'end-node':
            return dTypes.end;
        default:
            return dTypes.task;
    }
};

/**
 * Will parse values when dealing with a Branch and recursively find and build
 * any other node types.
 * @param root      Parent root for Branch; will render independent DAG and
 *                  add as a child node of root.
 * @param context
 */
export const parseBranch = (
    root: dNode,
    context: CompiledNode,
    workflow: CompiledWorkflowClosure
) => {
    console.log('@parseBranch: context:', context);
    const thenNodeCompiledNode = context.branchNode?.ifElse?.case
        ?.thenNode as CompiledNode;
    const thenNodeDNode = createDNode(thenNodeCompiledNode, context);
    const { startNode, endNode } = buildBranchStartEndNodes(root);

    /* We must this container node regardless */
    root.nodes.push(thenNodeDNode);

    /* Check if thenNode has branch */
    if (thenNodeCompiledNode.branchNode) {
        buildDAG(thenNodeDNode, thenNodeCompiledNode, dTypes.branch, workflow);
    } else {
        /* Find any 'other' (else if) nodes */
        const otherArr = context.branchNode?.ifElse?.other;

        if (otherArr) {
            otherArr.map(otherItem => {
                const otherCompiledNode: CompiledNode = otherItem.thenNode as CompiledNode;
                if (otherCompiledNode.branchNode) {
                    const otherDNodeBranch = createDNode(
                        otherCompiledNode,
                        context
                    );
                    buildDAG(
                        otherDNodeBranch,
                        otherCompiledNode,
                        dTypes.branch,
                        workflow
                    );
                } else {
                    const taskType = getTaskTypeFromCompiledNode(
                        otherCompiledNode.taskNode,
                        workflow.tasks
                    );
                    const otherDNode = createDNode(
                        otherCompiledNode,
                        context,
                        taskType
                    );
                    root.nodes.push(otherDNode);
                }
            });
        }
    }

    for (let i = 0; i < root.nodes.length; i++) {
        const startEdge: dEdge = {
            sourceId: startNode.id,
            targetId: root.nodes[i].id
        };
        const endEdge: dEdge = {
            sourceId: root.nodes[i].id,
            targetId: endNode.id
        };
        root.edges.push(startEdge);
        root.edges.push(endEdge);
    }

    /* Add back to root */
    root.nodes.push(startNode);
    root.nodes.push(endNode);
};

const createDNode = (
    compiledNode: CompiledNode,
    workflowTemplate: WorkflowTemplate,
    taskTemplate?: TaskTemplate
): dNode => {
    const nodeValue =
        taskTemplate == null
            ? compiledNode
            : { ...compiledNode, ...taskTemplate };

    const output = {
        id: createId(workflowTemplate, compiledNode.id),
        value: nodeValue,
        type: getTypeFromCompiledNode(compiledNode),
        name: getDisplayName(compiledNode),
        nodes: [],
        edges: []
    } as dNode;
    return output;
};

const createId = (template: WorkflowTemplate, name): string => {
    const output = `${template.id.name}_${template.id.version}_${name}`;
    return output;
};

const getTypeFromCompiledNode = (node: CompiledNode): dTypes => {
    if (node.id == 'start-node') {
        return dTypes.start;
    } else if (node.id == 'end-node') {
        return dTypes.end;
    } else if (node.branchNode) {
        return dTypes.branch;
    } else if (node.workflowNode) {
        return dTypes.subworkflow;
    } else {
        return dTypes.task;
    }
};

/**
 * Utility funciton assumes (loose) parity between [a]->[b] if matching
 * keys have matching values.
 * @param a     object
 * @param b     object
 * @returns     boolean
 */
export const checkIfObjectsAreSame = (a, b) => {
    for (const k in a) {
        if (a[k] != b[k]) {
            return false;
        }
    }
    return true;
};

export const buildBranchStartEndNodes = (root: dNode) => {
    const startNode = buildDNode(
        {
            id: `${root.id}-start-node`,
            metadata: {
                name: DISPLAY_NAME_START
            }
        } as CompiledNode,
        dTypes.nestedStart
    );

    const endNode = buildDNode(
        {
            id: `${root.id}-end-node`,
            metadata: {
                name: DISPLAY_NAME_END
            }
        } as CompiledNode,
        dTypes.nestedEnd
    );

    return {
        startNode,
        endNode
    };
};

export const buildStartEndEdges = (root: dNode, type: dTypes | null = null) => {
    const startNode: dNode = root.nodes[0];
    const endNode: dNode = root.nodes[1];
    const startEdge = {
        sourceId: startNode.id,
        targetId: root.nodes[2].id
    };
    const endEdge = {
        sourceId: root.nodes[root.nodes.length - 1].id,
        targetId: endNode.id
    };
    root.edges.push(startEdge);
    root.edges.push(endEdge);
};

const getSubWorkflowFromId = (id, workflow) => {
    const { subWorkflows } = workflow;
    /* Find current matching entitity from subWorkflows */
    for (const k in subWorkflows) {
        const subWorkflowId = subWorkflows[k].template.id;
        if (checkIfObjectsAreSame(subWorkflowId, id)) {
            return subWorkflows[k];
        }
    }
    return false;
};

const getTaskTypeFromCompiledNode = (
    taskNode: TaskNode,
    tasks: CompiledTask[]
) => {
    for (let i = 0; i < tasks.length; i++) {
        const template: TaskTemplate = tasks[i];
        const templateId: Identifier = template.id;
        if (checkIfObjectsAreSame(templateId, taskNode.referenceId)) {
            console.log('FOUND CORRECT TASK TYPE MAPPING!:', template);
            return template;
        }
    }
    return false;
};

/**
 * Handles parsing CompiledWorkflow data objects
 *
 * @param root          Root node for the graph that will be rendered
 * @param context       The current workflow (could be child of main workflow)
 * @param type          Type (sub or primrary)
 * @param workflow      Main parent workflow
 */
export const parseWorkflow = (
    root,
    context: CompiledWorkflow,
    type: dTypes,
    workflow: CompiledWorkflowClosure
) => {
    console.log('@parseWorkflow:', root, context, type, workflow);

    const nodesList = context.template.nodes;
    const nodeMap = {};

    /* Create mapping of id => dNode for all nodes */
    for (let i = 0; i < nodesList.length; i++) {
        const dNode: dNode = createDNode(nodesList[i], context.template);
        nodeMap[nodesList[i].id] = {
            dNode: dNode,
            compiledNode: nodesList[i]
        };
    }

    const startNode = nodeMap['start-node'].dNode;
    const contextualRoot = root == null ? startNode : root;

    const buildOutNodesFromContext = (
        root: dNode,
        context: WorkflowTemplate
    ): void => {
        for (let i = 0; i < context.nodes.length; i++) {
            const compiledNode: CompiledNode = context.nodes[i];
            let dNode: dNode = createDNode(compiledNode, context);
            if (compiledNode.branchNode) {
                buildDAG(dNode, compiledNode, dTypes.branch, workflow);
            } else if (compiledNode.workflowNode) {
                const id = compiledNode.workflowNode.subWorkflowRef;
                const subworkflow = getSubWorkflowFromId(id, workflow);
                buildDAG(dNode, subworkflow, dTypes.subworkflow, workflow);
            } else if (compiledNode.taskNode) {
                const taskType = getTaskTypeFromCompiledNode(
                    compiledNode.taskNode,
                    workflow.tasks
                );
                console.log('\n\n\n>>>> creating new dNode with taskTEmplate');
                dNode = createDNode(compiledNode, context, taskType);
            }

            contextualRoot.nodes.push(dNode);
        }
    };

    const buildOutEdges = (root, context: ConnectionSet, ingress, nodeMap) => {
        const list = context.downstream[ingress].ids;
        for (let i = 0; i < list.length; i++) {
            const edge: dEdge = {
                sourceId: nodeMap[ingress].dNode.id,
                targetId: nodeMap[list[i]].dNode.id
            };
            root.edges.push(edge);
            if (context.downstream[list[i]]) {
                buildOutEdges(root, context, list[i], nodeMap);
            }
        }
    };

    /* Build DAG */
    buildOutNodesFromContext(contextualRoot, context.template);
    buildOutEdges(contextualRoot, context.connections, 'start-node', nodeMap);

    return startNode;
};

/**
 * Mutates root (if passed) by recursively rendering DAG of given context.
 *
 * @param root          Root node of DAG
 * @param graphType     DAG type (eg, branch, workflow)
 * @param context       Pointer to current context of response
 */
export const buildDAG = (
    root: dNode,
    context: any,
    graphType: dTypes,
    workflow: CompiledWorkflowClosure
) => {
    switch (graphType) {
        case dTypes.branch:
            console.log('\n\n\n-----SWITCH Branch-----\n\n\n');
            parseBranch(root, context, workflow);
            break;
        case dTypes.subworkflow:
            console.log('\n\n\n-----SWITCH Subworkflow-----\n\n\n');
            parseWorkflow(root, context, graphType, workflow);
            break;
        case dTypes.primary:
            console.log('\n\n\n-----SWITCH Primary-----\n\n\n');
            return parseWorkflow(root, context, graphType, workflow);
        default:
            console.log('\n\n\n-----SWITCH default-----\n\n\n');
    }
};
