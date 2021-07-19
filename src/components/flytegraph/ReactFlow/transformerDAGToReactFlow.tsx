import { dEdge, dNode, dTypes } from 'models/Graph/types';
import { RFEntity } from './types';
import { MAX_RENDER_DEPTH, ReactFlowGraphConfig } from './utils';

export const buildCustomNodeName = (type: dTypes) => {
    return `${ReactFlowGraphConfig.customNodePrefix}_${dTypes[type]}`;
};

export const buildReactFlowEdge = (edge: dEdge): RFEntity => {
    return {
        id: `[${edge.sourceId}]->[${edge.targetId}]`,
        source: edge.sourceId,
        target: edge.targetId,
        sourceHandle: 'left-handle',
        arrowHeadType: ReactFlowGraphConfig.arrowHeadType,
        type: ReactFlowGraphConfig.edgeType
    } as RFEntity;
};

export const buildReactFlowNode = (
    dNode: dNode,
    dag = [],
    typeOverride: dTypes = null
): RFEntity => {
    const type =
        typeOverride != null ? typeOverride : buildCustomNodeName(dNode.type);
    console.log('@buildReactFlowNode typeOverride', typeOverride);
    console.log('\tTASK TYPE:', type);

    let taskType = null;

    if (dNode?.value) {
        console.log('@DAG->RF: dNode has value', dNode);
    }

    if (dNode?.value?.template) {
        console.log('@DAG->RF: Task template not null, adding');
        taskType = dNode.value.template.type;
    }
    return {
        id: dNode.id,
        type: type,
        data: {
            text: dNode.name,
            handles: [],
            nodeType: dNode.type,
            dag: dag,
            taskType: taskType
        },
        position: { x: 0, y: 0 },
        sourcePosition: '',
        targetPosition: ''
    } as RFEntity;
};

export const nodeMapToArr = map => {
    const output = [];
    for (const k in map) {
        output.push(map[k]);
    }
    return output;
};

export const ConvertFlyteDagToReactFlows = (root: dNode): RFEntity[] => {
    const dagToReactFlow = (dag: dNode, currentDepth = 0) => {
        const nodes = {};
        const edges = [];
        dag.nodes?.map(dNode => {
            if (dNode.nodes?.length > 0 && currentDepth <= MAX_RENDER_DEPTH) {
                console.log('current Depth:', currentDepth);
                /**
                 * @TODO
                 * Once we fix mapping task types to nodes retun this line to
                 *  currentDepth == MAX_RENDER_DEPT
                 */
                if (currentDepth > MAX_RENDER_DEPTH) {
                    console.log(
                        `\tif case: ${currentDepth} == ${MAX_RENDER_DEPTH}`
                    );
                    nodes[dNode.id] = buildReactFlowNode(
                        dNode,
                        [],
                        dTypes.nestedMaxDepth
                    );
                } else {
                    console.log(
                        `\telse case: ${currentDepth} != ${MAX_RENDER_DEPTH}`
                    );
                    nodes[dNode.id] = buildReactFlowNode(
                        dNode,
                        dagToReactFlow(dNode, currentDepth + 1)
                    );
                }
            } else {
                nodes[dNode.id] = buildReactFlowNode(dNode);
            }
        });
        dag.edges?.map(edge => {
            edges.push(buildReactFlowEdge(edge));
        });
        const output = nodeMapToArr(nodes).concat(edges);
        return output;
    };

    const rfJson = dagToReactFlow(root);
    console.log('@ConvertFlyteDagToReactFlows: =>', rfJson);
    return rfJson;
};

// export const ConvertFlyteDagToReactFlows = (root: dNode): RFEntity[] => {
//     const nodes = {};
//     const edges = [];

//     const dagToReactFlow = (dag: dNode): RFEntity[] => {
//         nodes[dag.id] = buildReactFlowNode(dag);
//         dag.nodes?.map(dNode => {
//             nodes[dNode.id] = buildReactFlowNode(dNode);
//             if (dNode.nodes?.length > 0) {
//                 dagToReactFlow(dNode);
//             }
//         });
//         dag.edges?.map(edge => {
//             edges.push(buildReactFlowEdge(edge));
//         });
//     };

//     dagToReactFlow(root);

//     const output = nodeMapToArr(nodes).concat(edges);
//     console.log('@ConvertFlyteDagToReactFlows: =>', output);
//     return output;
// };

// export const ConvertFlyteDagToReactFlows = (root: dNode): RFEntity[] => {
//     let currentDepth = 0;
//     const maxDepth = 10;

//     const dagToReactFlow = (dag: dNode): RFEntity[] => {
//         console.log('----------------------------------------------------');
//         console.log('@dagToReactFlow:');
//         console.log('\tcurrentDepth:', currentDepth);
//         console.log('\tdag:', dag);
//         const output = [];

//         dag.nodes?.map(dNode => {
//             if (dNode.nodes?.length > 0) {
//                 currentDepth++;
//                 console.log('\n\t\tdNode has children:');
//                 console.log('\t\tdNode.id:', dNode.id);
//                 console.log('\t\tdNode:', dNode);
//                 console.log('\t\tdNode.nodes: currentDepth++');
//                 if (currentDepth >= maxDepth) {
//                     output.push(buildAsNodeWithChildren(dNode));
//                 } else {
//                     output.push(
//                         buildReactFlowNode(dNode, dagToReactFlow(dNode))
//                     );
//                 }
//             } else {
//                 console.log('\n\t\tdNode DOES NOT have children:');
//                 console.log('\t\tdNode.id:', dNode.id);
//                 console.log('\t\tdNode:', dNode);
//                 output.push(buildReactFlowNode(dNode));
//             }
//         });

//         dag.edges?.map(edge => {
//             output.push(buildReactFlowEdge(edge));
//         });

//         if (currentDepth >= maxDepth) {
//             console.log('@dagToReactFlow: reached max depth', currentDepth);
//             return output;
//         } else {
//             console.log('...not at max depth yet - continuing');
//         }

//         return output;
//     };
//     console.log('@ConvertFlyteDagToReactFlows: input:', root);
//     const output = dagToReactFlow(root);
//     console.log('@ConvertFlyteDagToReactFlows: =>', output);
//     return output;
// };
