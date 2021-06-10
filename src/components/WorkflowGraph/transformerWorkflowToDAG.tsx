import {
    DISPLAY_NAME_END,
    DISPLAY_NAME_START
} from 'components/flytegraph/ReactFlow/utils';
import { dTypes, dEdge, dNode } from 'models/Graph/types';
import { CompiledNode, ConnectionSet } from 'models/Node/types';
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

/** Wraps a graph entity in a dNode
 * @param context: graph entity to be wrapped in dNode
 */
export const buildDNode = (context: any, type: dTypes): dNode => {
    const output = {
        id: getId(context),
        value: context,
        type: type,
        name: `${getDisplayName(context)}:[${dTypes[type]}]`,
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
    console.log('@parseBranch', root);
    const thenNodeCompiledNode = context.branchNode?.ifElse?.case
        ?.thenNode as CompiledNode;
    const thenNodeDNode = buildDNode(thenNodeCompiledNode, dTypes.task);
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
                const otherDNode = buildDNode(otherCompiledNode, dTypes.task);
                if (otherCompiledNode.branchNode) {
                    buildDAG(
                        otherDNode,
                        otherCompiledNode,
                        dTypes.branch,
                        workflow
                    );
                } else {
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
    node: CompiledNode,
    template: WorkflowTemplate,
    typeOverride = null
): dNode => {
    const output = {
        id: createId(template, node.id),
        value: node,
        type: getTypeFromCompiledNode(node),
        name: `${getDisplayName(node)}:[${
            dTypes[getTypeFromCompiledNode(node)]
        }]`,
        nodes: [],
        edges: []
    } as dNode;
    return output;
};

const createId = (template, name): string => {
    const output = `${template.id.name}_${template.id.version}_${name}`;
    return output;
};

// const getTruncatedId = (id): string => {
//     const startIndex = id.lastIndexOf('_');
//     const output = id.substring(startIndex + 1);
//     return output;
// };

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

/**
 * Note: this assumes data from response will always include start/end nodes
 * as the first two members of the array.
 * @param root
 */
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

/* Funciton mutates root.nodes[] */
/**
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
            const dNode: dNode = createDNode(compiledNode, context);
            if (compiledNode.branchNode) {
                buildDAG(dNode, compiledNode, dTypes.branch, workflow);
            } else if (compiledNode.workflowNode) {
                const id = compiledNode.workflowNode.subWorkflowRef;
                const subworkflow = getSubWorkflowFromId(id, workflow);
                buildDAG(dNode, subworkflow, dTypes.subworkflow, workflow);
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
 * Will recursively render DAG of given context consisting of nodes and edges.
 * Nodes are wrapped in dNode in
 * order to represent other DAGS.
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

// /**
//  *
//  * @param root          Root node for the graph that will be rendered
//  * @param context       The current workflow (could be child of main workflow)
//  * @param type          Type (sub or primrary)
//  * @param workflow      Main parent workflow
//  */
// export const parseWorkflowSave = (
//     root,
//     context: CompiledWorkflow,
//     type: dTypes,
//     workflow: CompiledWorkflowClosure
// ) => {
//     console.log('@parseWorkflow:', root, context, type, workflow);

//     const downstreamPointer = context.connections.downstream;
//     const nodesListPointer = context.template.nodes;
//     const nodeMap = {};

//     /* Create mapping of id => dNode for all nodes */
//     for (let i = 0; i < nodesListPointer.length; i++) {
//         const dNode: dNode = createDNode(nodesListPointer[i], context.template);
//         nodeMap[nodesListPointer[i].id] = {
//             dNode: dNode,
//             compiledNode: nodesListPointer[i]
//         };
//     }

//     console.log('\tnodeMap:', nodeMap);

//     /* Recursively build out children */
//     const buildOut = parentDNode => {
//         const parentNodeId = getTruncatedId(parentDNode.id);
//         const downstreamList = downstreamPointer[parentNodeId].ids;

//         /* Build graph from downstreams of start-node */
//         for (let i = 0; i < downstreamList.length; i++) {
//             const currentId = downstreamList[i];

//             const currentDNode: dNode = nodeMap[currentId].dNode;
//             const currentCompiledNode: CompiledNode =
//                 nodeMap[currentId].compiledNode;

//             if (currentCompiledNode.workflowNode) {
//                 const { subWorkflows } = workflow;
//                 const subWorkflowRef =
//                     currentCompiledNode.workflowNode.subWorkflowRef;

//                 /* Find current matching entitity from subWorkflows */
//                 for (const k in subWorkflows) {
//                     const subWorkflowId = subWorkflows[k].template.id;
//                     if (checkIfObjectsAreSame(subWorkflowId, subWorkflowRef)) {
//                         buildDAG(
//                             currentDNode,
//                             dTypes.subworkflow,
//                             subWorkflows[k],
//                             workflow
//                         );
//                     }
//                 }
//             } else if (currentCompiledNode.branchNode) {
//                 console.log('@PArseWorkflow ==> BRANCH');
//                 buildDAG(
//                     currentDNode,
//                     dTypes.branch,
//                     currentCompiledNode,
//                     workflow
//                 );
//             }

//             /* Build edge */
//             const edge: dEdge = {
//                 sourceId: parentDNode.id,
//                 targetId: currentDNode.id
//             };

//             /* Add to parent (dNode) nodes[] /*/
//             parentDNode.nodes.push(currentDNode);
//             /* Add edge */
//             parentDNode.edges.push(edge);

//             if (downstreamPointer[currentId]?.ids.length > 0) {
//                 buildOut(currentDNode);
//             }
//         }
//     };

//     /* Build DAG */
//     const startNode = nodeMap['start-node'].dNode;
//     buildOut(startNode);

//     /* Root is null for corporal/primary root */
//     if (root) {
//         root.nodes.push(startNode);
//     } else {
//         return startNode;
//     }
// };

// export const parseNodeList = (
//     root: dNode,
//     context: Array<CompiledNode>,
//     workflow: CompiledWorkflowClosure
// ) => {
//     let previous: dNode;
//     console.log('@parseNodeList:');
//     console.log('\troot:', root);
//     console.log('\tcontext:', context);
//     console.log('\tworkflow:', workflow);

//     for (let i = 0; i < context.length; i++) {
//         console.log('\t\tfor():');
//         const node: CompiledNode = context[i] as CompiledNode;
//         let dNode: dNode;

//         /* Recurse if has branch node */
//         if (node.branchNode) {
//             console.log('\t\t\t:node.branchNode');
//             buildDAG(root, dTypes.branch, node, workflow);
//         } else if (node.workflowNode) {
//             console.log('\t\t\t:node.workflowNode');
//             buildDAG(root, dTypes.subworkflow, node, workflow);
//         } else {
//             console.log('\t\t\t:CASE:ELSE');
//             const type: dTypes = checkStartEndType(node);
//             dNode = buildDNode(node, type);
//             root.nodes.push(dNode);
//         }

//         /* Edges are set with parent */
//         if (previous && i > 1) {
//             const edge: dEdge = {
//                 sourceId: previous.id,
//                 targetId: dNode.id
//             };
//             root.edges.push(edge);
//         }
//         if (i > 1) {
//             previous = dNode;
//         }
//     }

//     buildStartEndEdges(root);
// };
