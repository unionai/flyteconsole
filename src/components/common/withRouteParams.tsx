import * as queryString from 'query-string';
import * as React from 'react';
import { useParams } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';

// Wraps a component which expects route params specified by the interface
// ParamsType and returns a HoC which will extract the params from props.match.params
// and render the passed component with those params as top-level props.
export function withRouteParams<ParamsType>(
    Component: React.ComponentType<ParamsType>
): React.FunctionComponent<RouteComponentProps<ParamsType>> {
    return ({ match, location }) => {
        match.params.query = {};
        if (location.search) {
            match.params.query = queryString.parse(location.search);
        }
        return <Component {...match.params} />;
    };
}
