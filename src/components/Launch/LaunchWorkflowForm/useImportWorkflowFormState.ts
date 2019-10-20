import { useAPIContext } from 'components/data/apiContext';
import {
    useFetchableData,
    useWorkflow,
    useWorkflows,
    waitForAllFetchables
} from 'components/hooks';
import {
    FilterOperationName,
    LaunchPlan,
    SortDirection,
    Workflow,
    WorkflowExecutionIdentifier,
    WorkflowId,
    workflowSortFields
} from 'models';
import { useEffect, useMemo, useState } from 'react';
import { history, Routes } from 'routes';
import { SearchableSelectorOption } from './SearchableSelector';
import { ImportWorkflowFormProps } from './types';
import {
    formatLabelWithType,
    launchPlansToSearchableSelectorOptions,
    workflowsToSearchableSelectorOptions
} from './utils';

export function useWorkflowSelectorOptions(workflows: Workflow[]) {
    return useMemo(
        () => {
            const options = workflowsToSearchableSelectorOptions(workflows);
            if (options.length > 0) {
                options[0].description = 'latest';
            }
            return options;
        },
        [workflows]
    );
}

function useLaunchPlanSelectorOptions(launchPlans: LaunchPlan[]) {
    return useMemo(() => launchPlansToSearchableSelectorOptions(launchPlans), [
        launchPlans
    ]);
}

function useLaunchPlansForWorkflow(
    workflowId: WorkflowId | null = null,
    host?: string
) {
    const { listLaunchPlans } = useAPIContext();
    return useFetchableData<LaunchPlan[], WorkflowId | null>(
        {
            autoFetch: workflowId !== null,
            debugName: 'useLaunchPlansForWorkflow',
            defaultValue: [],
            doFetch: async workflowId => {
                if (workflowId === null) {
                    return Promise.reject('No workflowId specified');
                }
                const { project, domain, name, version } = workflowId;
                const { entities } = await listLaunchPlans(
                    { project, domain },
                    // TODO: Only active?
                    {
                        filter: [
                            {
                                key: 'workflow.name',
                                operation: FilterOperationName.EQ,
                                value: name
                            },
                            {
                                key: 'workflow.version',
                                operation: FilterOperationName.EQ,
                                value: version
                            }
                        ],
                        limit: 10
                    },
                    host
                );
                return entities;
            }
        },
        workflowId
    );
}

// Contains all of the form state for a ImportWorkflowForm
export function useImportWorkflowFormState({
    onClose,
    workflowId,
    host
}: ImportWorkflowFormProps): ImportWorkflowFormState {
    const {
        registerProject,
        createTask,
        createWorkflow,
        createLaunchPlan
    } = useAPIContext();
    const workflows = useWorkflows(
        workflowId,
        {
            limit: 10,
            sort: {
                key: workflowSortFields.createdAt,
                direction: SortDirection.DESCENDING
            }
        },
        host
    );
    const workflowSelectorOptions = useWorkflowSelectorOptions(workflows.value);
    const [selectedWorkflow, setWorkflow] = useState<
        SearchableSelectorOption<WorkflowId>
    >();
    const selectedWorkflowId = selectedWorkflow ? selectedWorkflow.data : null;

    // We have to do a single item get once a workflow is selected so that we
    // receive the full workflow spec
    const workflow = useWorkflow(selectedWorkflowId, host);
    const launchPlans = useLaunchPlansForWorkflow(selectedWorkflowId, host);
    const launchPlanSelectorOptions = useLaunchPlanSelectorOptions(
        launchPlans.value
    );

    const [selectedLaunchPlan, setLaunchPlan] = useState<
        SearchableSelectorOption<LaunchPlan>
    >();
    const launchPlanData = selectedLaunchPlan
        ? selectedLaunchPlan.data
        : undefined;

    const workflowOptionsLoadingState = waitForAllFetchables([workflows]);
    const launchPlanOptionsLoadingState = waitForAllFetchables([launchPlans]);

    const inputLoadingState = waitForAllFetchables([workflow, launchPlans]);

    const workflowName = workflowId.name;

    const onSelectWorkflow = (
        newWorkflow: SearchableSelectorOption<WorkflowId>
    ) => {
        setLaunchPlan(undefined);
        setWorkflow(newWorkflow);
    };

    const importWorkflow = async () => {
        const compiledWorkflow = workflow.value.closure.compiledWorkflow;
        const workflowTemplate = compiledWorkflow.primary.template;
        const taskTemplates = compiledWorkflow.tasks.map(
            value => value.template
        );
        const launchPlanSpec = launchPlanData;
        if (!launchPlanData) {
            throw new Error('Attempting to launch with no LaunchPlan');
        }
        const { domain, project } = workflowId;

        // register Project
        try {
            await registerProject(project);
        } catch (err) {
            // 409 means the project already exists
            if (err.response.status !== 409) {
                throw error;
            }
        }

        // register each task
        for (let i = 0; i < taskTemplates.length; i = i + 1) {
            try {
                await createTask(taskTemplates[i]);
            } catch (err) {
                // 409 means the task already exists
                if (err.response.status !== 409) {
                    throw error;
                }
            }
        }

        workflowTemplate.nodes = workflowTemplate.nodes.filter(
            node => node.id !== 'start-node' && node.id !== 'end-node'
        );

        // register Workflow
        try {
            const workflowResponse = await createWorkflow(workflowTemplate);
        } catch (err) {
            // 409 means the workflow already exists
            if (err.response.status !== 409) {
                throw error;
            }
        }

        // register LaunchPlan
        try {
            await createLaunchPlan(launchPlanSpec);
        } catch (err) {
            // 409 means the launchPlan already exists
            if (err.response.status !== 409) {
                throw error;
            }
        }

        const workflowName = workflowTemplate.id.name;

        history.push(
            Routes.WorkflowDetails.makeUrl(project, domain, workflowName)
        );
    };

    const submissionState = useFetchableData<WorkflowExecutionIdentifier>({
        autoFetch: false,
        debugName: 'ImportWorkflowForm',
        defaultValue: {} as WorkflowExecutionIdentifier,
        doFetch: importWorkflow
    });

    const onSubmit = submissionState.fetch;
    const onCancel = onClose;

    // Once workflows have loaded, attempt to select the first option
    useEffect(
        () => {
            if (workflowSelectorOptions.length > 0 && !selectedWorkflow) {
                setWorkflow(workflowSelectorOptions[0]);
            }
        },
        [workflows.value]
    );

    // Once launch plans have been loaded, attempt to select the default
    // launch plan
    useEffect(
        () => {
            if (!launchPlanSelectorOptions.length) {
                return;
            }
            const defaultLaunchPlan = launchPlanSelectorOptions.find(
                ({ id }) => id === workflowId.name
            );
            setLaunchPlan(defaultLaunchPlan);
        },
        [launchPlanSelectorOptions]
    );

    return {
        inputLoadingState,
        launchPlanOptionsLoadingState,
        launchPlanSelectorOptions,
        onCancel,
        onSelectWorkflow,
        onSubmit,
        selectedLaunchPlan,
        selectedWorkflow,
        submissionState,
        workflowName,
        workflowOptionsLoadingState,
        workflowSelectorOptions,
        onSelectLaunchPlan: setLaunchPlan
    };
}
