import { makeStyles, Theme } from '@material-ui/core/styles';
import DeviceHub from '@material-ui/icons/DeviceHub';
import classNames from 'classnames';
import { useNamedEntityListStyles } from 'components/common/SearchableNamedEntityList';
import { useCommonStyles } from 'components/common/styles';
import {
    separatorColor,
    primaryTextColor,
    workflowLabelColor
} from 'components/Theme/constants';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Routes } from 'routes/routes';
import { WorkflowListItem } from 'graphql/Workflow/types';
import { formatDateUTC } from 'common/formatters';
import { timestampToDate } from 'common/utils';
import * as Long from 'long';
import ProjectStatusBar from '../Project/ProjectStatusBar';
import { WorkflowExecutionPhase } from 'models/Execution/enums';
import { Variable } from 'models/Common/types';

interface SearchableWorkflowNameListProps {
    workflows: WorkflowListItem[];
}

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        padding: 13,
        paddingRight: 71
    },
    itemContainer: {
        marginBottom: 15,
        borderRadius: 16,
        padding: '23px 30px',
        border: `1px solid ${separatorColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    itemName: {
        display: 'flex',
        fontWeight: 600,
        color: primaryTextColor,
        marginBottom: 10
    },
    itemDescriptionRow: {
        color: '#757575',
        marginBottom: 30
    },
    itemIcon: {
        marginRight: 14,
        color: '#636379'
    },
    itemRow: {
        display: 'flex',
        marginBottom: 10,
        '&:last-child': {
            marginBottom: 0
        }
    },
    itemLabel: {
        width: 140,
        fontSize: 14,
        color: workflowLabelColor
    }
}));

const padExecutions = (items: WorkflowExecutionPhase[]) => {
    if (items.length >= 10) {
        return items.slice(0, 10).reverse();
    }
    const emptyExecutions = new Array(10 - items.length).fill(
        WorkflowExecutionPhase.QUEUED
    );
    return [...items, ...emptyExecutions].reverse();
};

const getVariables = (variables?: Record<string, Variable>) => {
    if (!variables) {
        return undefined;
    }
    return Object.values(variables)
        .map(variable => {
            return variable.description;
        })
        .join(', ');
};

/** Renders a searchable list of Workflow names, with associated descriptions */
export const SearchableWorkflowNameList: React.FC<SearchableWorkflowNameListProps> = props => {
    const commonStyles = useCommonStyles();
    const listStyles = useNamedEntityListStyles();
    const styles = useStyles();

    const renderItem = (workflowItem: WorkflowListItem, idx: number) => {
        const {
            id,
            lastExecutions,
            description,
            closure: { compiledWorkflow }
        } = workflowItem;
        const key = `${id.project}/${id.domain}/${id.name}/${idx}`;
        let latestExecutionTime = '';
        const hasExecutions = lastExecutions.length > 0;
        if (hasExecutions) {
            const latestExecution = lastExecutions[0].closure.createdAt;
            const timeStamp = {
                nanos: latestExecution.nanos,
                seconds: Long.fromValue(latestExecution.seconds!)
            };
            latestExecutionTime = formatDateUTC(timestampToDate(timeStamp));
        }
        const executionStatus = lastExecutions.map(
            execution => execution.closure.phase
        );
        const inputs = getVariables(
            compiledWorkflow?.primary.template.interface?.inputs?.variables
        );
        const outputs = getVariables(
            compiledWorkflow?.primary.template.interface?.outputs?.variables
        );
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
                <div
                    className={classNames(
                        listStyles.searchResult,
                        styles.itemContainer
                    )}
                >
                    <div className={styles.itemName}>
                        <DeviceHub className={styles.itemIcon} />
                        <div>{id.name}</div>
                    </div>
                    <div className={styles.itemDescriptionRow}>
                        {description?.length
                            ? description
                            : 'This workflow has no description.'}
                    </div>
                    <div className={styles.itemRow}>
                        <div className={styles.itemLabel}>
                            Last execution time
                        </div>
                        <div>
                            {hasExecutions ? (
                                latestExecutionTime
                            ) : (
                                <em>No executions found</em>
                            )}
                        </div>
                    </div>
                    <div className={styles.itemRow}>
                        <div className={styles.itemLabel}>
                            Last 10 executions
                        </div>
                        <ProjectStatusBar
                            items={padExecutions(executionStatus)}
                        />
                    </div>
                    <div className={styles.itemRow}>
                        <div className={styles.itemLabel}>Inputs</div>
                        <div>{inputs ?? <em>No input data found.</em>}</div>
                    </div>
                    <div className={styles.itemRow}>
                        <div className={styles.itemLabel}>Outputs</div>
                        <div>{outputs ?? <em>No output data found.</em>}</div>
                    </div>
                </div>
            </Link>
        );
    };
    return (
        <div className={styles.container}>
            {props.workflows.map((workflow, idx) => {
                return renderItem(workflow, idx);
            })}
        </div>
    );
};
