import * as React from 'react';
import { Handle } from 'react-flow-renderer';
import { dTypes } from 'models/Graph/types';
import { ReactFlowWrapper } from './ReactFlowWrapper';
import { getGraphHandleStyle, getGraphNodeStyle, rfBackground } from './utils';
import { RFGraphTypes } from './types';

export const ReactFlowCustomNestedPoint = ({ data }: any) => {
    const containerStyle = getGraphNodeStyle(data.nodeType);
    const isStart = data.nodeType == dTypes.nestedStart;
    const position = isStart ? 'right' : 'left';
    const type = 'nestedPoint';
    const id = isStart ? 'start' : 'end';
    const handleStyle = getGraphHandleStyle(type);
    return (
        <>
            <div style={containerStyle}></div>
            <Handle
                id={`cnn-${id}-${data.text}`}
                type={type}
                position={position}
                style={handleStyle}
            />
        </>
    );
};

/**
 * Custom component used by ReactFlow.  Renders a label (text)
 * and any edge handles.
 * @param props.data data property of ReactFlowGraphNodeData
 */

export const ReactFlowCustomTaskNode = ({ data }: any) => {
    const styles = getGraphNodeStyle(data.nodeType);
    const sourceHandle = getGraphHandleStyle('source');
    const targetHandle = getGraphHandleStyle('target');
    return (
        <>
            <div style={styles}>{data.text}</div>
            <Handle
                id={`cnt-left-${data.text}`}
                type="target"
                position="left"
                style={targetHandle}
            />
            <Handle
                id={`cnt-right-${data.text}`}
                type="source"
                position="right"
                style={sourceHandle}
            />
        </>
    );
};

export const RFCustomNodeSubworkflow = ({ data }: any) => {
    const sourceHandle = getGraphHandleStyle('source');
    const targetHandle = getGraphHandleStyle('target');
    const { dag } = data;
    const backgroundStyle = rfBackground.nested;

    const rfContainerStyle = {
        width: `300px`,
        height: `200px`
    };

    return (
        <>
            <Handle
                id={`bcn-left-${data.text}`}
                type="target"
                position="left"
                style={targetHandle}
            />
            <Handle
                id={`bcn-right-${data.text}`}
                type="source"
                position="right"
                style={sourceHandle}
            />
            <div style={rfContainerStyle}>
                <ReactFlowWrapper
                    rfGraphJson={dag}
                    backgroundStyle={backgroundStyle}
                    type={RFGraphTypes.nested}
                />
            </div>
        </>
    );
};

export const ReactFlowCustomBranchNode = ({ data }: any) => {
    const sourceHandle = getGraphHandleStyle('source');
    const targetHandle = getGraphHandleStyle('target');
    const { dag } = data;
    const backgroundStyle = rfBackground.nested;

    const rfContainerStyle = {
        width: `300px`,
        height: `200px`
    };

    return (
        <>
            <Handle
                id={`bcn-left-${data.text}`}
                type="target"
                position="left"
                style={targetHandle}
            />
            <Handle
                id={`bcn-right-${data.text}`}
                type="source"
                position="right"
                style={sourceHandle}
            />
            <div style={rfContainerStyle}>
                <ReactFlowWrapper
                    rfGraphJson={dag}
                    backgroundStyle={backgroundStyle}
                    type={RFGraphTypes.nested}
                />
            </div>
        </>
    );
};

export const ReactFlowCustomStartNode = ({ data }: any) => {
    const styles = getGraphNodeStyle(data.nodeType);
    const handleStyle = getGraphHandleStyle('source');
    return (
        <>
            <div style={styles}>{data.text}</div>
            <Handle type="source" position="right" style={handleStyle} />
        </>
    );
};

export const ReactFlowCustomEndNode = ({ data }: any) => {
    const styles = getGraphNodeStyle(data.nodeType);
    const handleStyle = getGraphHandleStyle('target');
    return (
        <>
            <div style={styles}>{data.text}</div>
            <Handle type="target" position="left" style={handleStyle} />
        </>
    );
};
