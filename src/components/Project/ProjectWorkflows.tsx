import { WaitForData } from 'components/common/WaitForData';
import { useWorkflowNameList } from 'components/hooks/useNamedEntity';
import { SearchableWorkflowNameList } from 'components/Workflow/SearchableWorkflowNameList';
import { Admin } from 'flyteidl';
import { limits } from 'models/AdminEntity/constants';
import { FilterOperationName, SortDirection } from 'models/AdminEntity/types';
import { workflowSortFields } from 'models/Workflow/constants';
import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { GetWorkflowList } from 'graphql/Workflow/workflow';
import { WorkflowListItem } from 'graphql/Workflow/types';
import { PaginatedFetchableData } from 'components/hooks/types';
import { SearchableInput } from 'components/common/SearchableList';

export interface ProjectWorkflowsProps {
    projectId: string;
    domainId: string;
}

const useStyles = makeStyles(() => ({
    searchInputContainer: {
        padding: '0 13px',
        margin: '32px 0 23px'
    }
}));

/** A listing of the Workflows registered for a project */
export const ProjectWorkflows: React.FC<ProjectWorkflowsProps> = ({
    domainId: domain,
    projectId: project
}) => {
    const styles = useStyles();
    const [searchString, setSearchString] = React.useState('');
    const workflowNames = useWorkflowNameList(
        { domain, project },
        {
            limit: limits.NONE,
            sort: {
                direction: SortDirection.ASCENDING,
                key: workflowSortFields.name
            },
            // Hide archived workflows from the list
            filter: [
                {
                    key: 'state',
                    operation: FilterOperationName.EQ,
                    value: Admin.NamedEntityState.NAMED_ENTITY_ACTIVE
                }
            ]
        }
    );

    const workflows: PaginatedFetchableData<WorkflowListItem> = GetWorkflowList(
        project,
        domain,
        {
            limit: limits.NONE,
            sort: {
                direction: SortDirection.ASCENDING,
                key: workflowSortFields.name
            }
            // Hide archived workflows from the list
        }
    );

    const handleSearchStringClear = () => setSearchString('');
    const handleSearchStringChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const searchString = event.target.value;
        setSearchString(searchString);
    };

    return (
        <WaitForData {...workflows}>
            <SearchableInput
                onClear={handleSearchStringClear}
                onSearchChange={handleSearchStringChange}
                variant="normal"
                value={searchString}
                className={styles.searchInputContainer}
                placeholder="Search Workflow Name"
            />
            <SearchableWorkflowNameList workflows={workflows.value} />
        </WaitForData>
    );
};
