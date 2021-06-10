import { dTypes } from 'models/Graph/types';
import { isNode } from 'react-flow-renderer';
import { RFBackgroundProps, RFEntity } from './types';

const dagre = require('dagre');

export const DISPLAY_NAME_START = 'start';
export const DISPLAY_NAME_END = 'end';

export const MAX_RENDER_DEPTH = 2;

export const ReactFlowGraphConfig = {
    customNodePrefix: 'FlyteNode',
    arrowHeadType: 'arrowClosed',
    edgeType: 'default'
};

const HandleIcon = require('./REPLACE_THIS_ICON.svg') as string;
export const getGraphHandleStyle = (type: string): object => {
    let size = 8;
    const offset = 10;

    let backgroundColor = `rgba(120,120,120,1)`;
    let marginLeft,
        marginRight = 0;

    if (type == 'target') {
        marginLeft = 0;
        marginRight = -offset;
        backgroundColor = '#777';
    } else if (type == 'source') {
        marginRight = 0;
        marginLeft = -offset;
        backgroundColor = '#777';
    } else if (type == 'nestedPoint') {
        backgroundColor = 'none';
        size = 1;
    }

    const baseStyle = {
        zIndex: 99999999,
        marginLeft: `${marginLeft}px`,
        marginRight: `${marginRight}px`,
        width: `${size}px`,
        height: `${size}px`,
        background: backgroundColor,
        backgroundImage: `url(${HandleIcon})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: '50% 50%',
        border: 'none'
    };
    return baseStyle;
};

export const getGraphNodeStyle = (type: dTypes): object => {
    /** Base styles for displaying graph nodes */
    const baseStyle = {
        boxShadow: '1px 3px 5px rgba(0,0,0,.2)',
        padding: '.25rem .75rem',
        fontSize: '.6rem',
        color: '#323232',
        borderRadius: '.25rem',
        border: '.15rem solid #555',
        background: '#fff',
        minWidth: '.5rem',
        minHeight: '.5rem',
        height: 'auto',
        width: 'auto'
    };

    const nestedPoint = {
        width: '1px',
        height: '1px',
        minWidth: '1px',
        minHeight: '1px',
        padding: 0,
        boxShadow: 'none',
        border: 'none',
        background: 'none',
        borderRadius: 'none'
    };

    /** Override the base styles with node-type specific styles */
    const overrideStyles = {
        start: {
            borderColor: '#ccc'
        },
        end: {
            borderColor: '#ccc'
        },
        nestedStart: {
            ...nestedPoint
        },
        nestedEnd: {
            ...nestedPoint
        },
        nestedWithChildren: {
            borderColor: 'purple'
        },
        branch: {
            display: 'flex',
            flexAlign: 'center',
            border: 'none',
            background: '#5b33b0',
            borderRadius: '0px',
            padding: '1rem 0',
            boxShadow: 'none',
            fontSize: '.6rem',
            color: '#efefef'
        },
        workflow: {
            borderColor: '#ccc'
        },
        task: {
            borderColor: '#37b789'
        }
    };
    const key = String(dTypes[type]);
    const output = {
        ...baseStyle,
        ...overrideStyles[key]
    };
    return output;
};

export const rfBackground = {
    main: {
        background: {
            border: '1px solid #444',
            backgroundColor: 'rgba(255,255,255,1)'
        },
        gridColor: '#ccc',
        gridSpacing: 20
    } as RFBackgroundProps,
    nested: {
        background: {
            border: '1px dashed #ccc',
            borderRadius: '10px',
            borderTopLeftRadius: '0',
            background: 'rgba(255,255,255,1)',
            padding: 0,
            margin: 0
        },
        gridColor: 'none',
        gridSpacing: 1
    } as RFBackgroundProps
};

export const setReactFlowGraphLayout = (
    elements: RFEntity[],
    direction: string
) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    const isHorizontal = direction === 'LR';

    dagreGraph.setGraph({
        rankdir: direction,
        edgesep: 20,
        nodesep: 40,
        ranker: 'longest-path',
        acyclicer: 'greedy'
    });

    /**
     * Note: Waits/assumes rendered dimensions from ReactFlow as .__rf
     */
    elements.forEach(el => {
        if (isNode(el)) {
            const nodeWidth = el.__rf.width;
            const nodeHeight = el.__rf.height;
            dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
        } else {
            dagreGraph.setEdge(el.source, el.target);
        }
    });

    dagre.layout(dagreGraph);

    return elements.map(el => {
        if (isNode(el)) {
            el.targetPosition = isHorizontal ? 'left' : 'top';
            el.sourcePosition = isHorizontal ? 'right' : 'bottom';
            const nodeWidth = el.__rf.width;
            const nodeHeight = el.__rf.height;
            const nodeWithPosition = dagreGraph.node(el.id);

            /** Keep both position and .__rf.position in sync */
            const x = nodeWithPosition.x - nodeWidth / 2;
            const y = nodeWithPosition.y - nodeHeight / 2;
            el.position = {
                x: x,
                y: y
            };
            el.__rf.position = {
                x: x,
                y: y
            };
        }
        return el;
    });
};

export default setReactFlowGraphLayout;
