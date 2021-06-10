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

export const buildReactFlowNode = (dNode: dNode, dag = []): RFEntity => {
    return {
        id: dNode.id,
        type: buildCustomNodeName(dNode.type),
        data: {
            text: dNode.name,
            handles: [],
            nodeType: dNode.type,
            dag: dag
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
    let currentDepth = 0;
    const maxDepth = MAX_RENDER_DEPTH;

    const dagToReactFlow = (dag: dNode) => {
        const nodes = {};
        const edges = [];
        dag.nodes?.map(dNode => {
            if (dNode.nodes?.length > 0) {
                nodes[dNode.id] = buildReactFlowNode(
                    dNode,
                    dagToReactFlow(dNode)
                );
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
