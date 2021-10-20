import { Typography } from '@material-ui/core';
import ChevronRight from '@material-ui/icons/ChevronRight';
import { SearchResult } from 'components/common/SearchableList';
import {
    SearchableNamedEntity,
    SearchableNamedEntityList,
    SearchableNamedEntityListProps,
    useNamedEntityListStyles
} from 'components/common/SearchableNamedEntityList';
import { useCommonStyles } from 'components/common/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Routes } from 'routes/routes';
import { WorkflowListItem } from 'graphql/Workflow/types';

interface SearchableWorkflowNameListProps {
    workflows: WorkflowListItem[];
}

/** Renders a searchable list of Workflow names, with associated descriptions */
export const SearchableWorkflowNameList: React.FC<SearchableWorkflowNameListProps> = props => {
    const commonStyles = useCommonStyles();
    const listStyles = useNamedEntityListStyles();

    const renderItem = (workflowItem: WorkflowListItem) => {
        const { id, lastExecutions } = workflowItem;
        const key = `${id.project}/${id.domain}/${id.name}`;
        console.log(lastExecutions);
        return (
            <Link
                key={key}
                className={commonStyles.linkUnstyled}
                to={Routes.WorkflowDetails.makeUrl(
                    id.project,
                    id.domain,
                    id.name
                )}
            >
                <div className={listStyles.searchResult}>
                    <div className={listStyles.itemName}>
                        <div>{id.name}</div>
                        <div>
                            {lastExecutions.map(execution => {
                                return <div>{execution?.id?.name}</div>;
                            })}
                        </div>
                    </div>
                    <ChevronRight className={listStyles.itemChevron} />
                </div>
            </Link>
        );
    };
    return (
        <div>
            {props.workflows.map(workflow => {
                return renderItem(workflow);
            })}
        </div>
    );
};
