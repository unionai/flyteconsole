import { dNode } from 'models/Graph/types';
import { endNodeId, startNodeId } from 'models/Node/constants';

export function isStartNode(node: dNode) {
    return node.id === startNodeId;
}

export function isEndNode(node: dNode) {
    return node.id === endNodeId;
}
