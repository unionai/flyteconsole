import { ConvertFlyteDagToReactFlows } from 'components/flytegraph/ReactFlow/transformerDAGToReactFlow';
import * as React from 'react';
import { RFWrapperProps, RFEntity, RFGraphTypes } from './types';
import { rfBackground } from './utils';
import { ReactFlowWrapper } from './ReactFlowWrapper';

const ReactFlowGraphComponent = props => {
    const { data } = props;
    console.log('ReactflowGraphComponent: data:', data);
    const rfGraphJson: RFEntity[] = ConvertFlyteDagToReactFlows(data);
    console.log('ReactflowGraphComponent: rfGraphJson:', rfGraphJson);
    const backgroundStyle = rfBackground.main;
    const ReactFlowProps: RFWrapperProps = {
        backgroundStyle,
        rfGraphJson: rfGraphJson,
        type: RFGraphTypes.main
    };
    console.log('@ReactFlowGraphComponent');
    console.log('\trfGraphJson:', rfGraphJson);
    console.log('\tRendering ReactFlow...');
    return <ReactFlowWrapper {...ReactFlowProps} />;
};

export default ReactFlowGraphComponent;
