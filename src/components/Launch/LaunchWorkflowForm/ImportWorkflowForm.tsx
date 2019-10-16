import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormHelperText,
    Typography
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { WaitForData } from 'components/common';
import { ButtonCircularProgress } from 'components/common/ButtonCircularProgress';
import { APIContextValue, useAPIContext } from 'components/data/apiContext';
import { smallFontSize } from 'components/Theme';
import {
    FilterOperationName,
    NamedEntityIdentifier,
    SortDirection,
    workflowSortFields
} from 'models';
import * as React from 'react';
import { SearchableSelector } from './SearchableSelector';
import { SimpleInput } from './SimpleInput';
import {
    ImportWorkflowFormProps,
    InputProps,
    InputType,
    LaunchWorkflowFormProps
} from './types';
import { UnsupportedInput } from './UnsupportedInput';
import { useImportWorkflowFormState } from './useImportWorkflowFormState';
import { useLaunchWorkflowFormState } from './useLaunchWorkflowFormState';
import { workflowsToSearchableSelectorOptions } from './utils';

const useStyles = makeStyles((theme: Theme) => ({
    footer: {
        padding: theme.spacing(2)
    },
    formControl: {
        padding: `${theme.spacing(1.5)}px 0`
    },
    header: {
        padding: theme.spacing(2),
        width: '100%'
    },
    inputsSection: {
        minHeight: theme.spacing(59),
        padding: theme.spacing(2)
    },
    inputLabel: {
        color: theme.palette.text.hint,
        fontSize: smallFontSize
    },
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%'
    }
}));

function getComponentForInput(input: InputProps) {
    switch (input.typeDefinition.type) {
        case InputType.Collection:
        case InputType.Map:
        case InputType.Schema:
        case InputType.Unknown:
        case InputType.None:
            return <UnsupportedInput {...input} />;
        default:
            return <SimpleInput {...input} />;
    }
}

function generateFetchSearchResults(
    { listWorkflows }: APIContextValue,
    workflowId: NamedEntityIdentifier,
    host: string
) {
    return async (query: string) => {
        const { entities: workflows } = await listWorkflows(
            workflowId,
            {
                filter: [
                    {
                        key: 'version',
                        operation: FilterOperationName.CONTAINS,
                        value: query
                    }
                ],
                sort: {
                    key: workflowSortFields.createdAt,
                    direction: SortDirection.DESCENDING
                }
            },
            host
        );
        return workflowsToSearchableSelectorOptions(workflows);
    };
}

/** Renders the form for initiating a Launch request based on a Workflow */
export const ImportWorkflowForm: React.FC<ImportWorkflowFormProps> = props => {
    const state = useImportWorkflowFormState(props);
    const { submissionState } = state;
    const launchPlanSelected = !!state.selectedLaunchPlan;
    const styles = useStyles();
    const fetchSearchResults = generateFetchSearchResults(
        useAPIContext(),
        props.workflowId,
        props.host
    );

    const submit: React.FormEventHandler = event => {
        event.preventDefault();
        state.onSubmit();
    };

    return (
        <>
            <DialogTitle disableTypography={true} className={styles.header}>
                <div className={styles.inputLabel}>Launch Workflow</div>
                <Typography variant="h6">{state.workflowName}</Typography>
            </DialogTitle>
            <DialogContent dividers={true} className={styles.inputsSection}>
                <WaitForData
                    spinnerVariant="medium"
                    {...state.workflowOptionsLoadingState}
                >
                    <div className={styles.formControl}>
                        <SearchableSelector
                            label="Workflow Version"
                            onSelectionChanged={state.onSelectWorkflow}
                            options={state.workflowSelectorOptions}
                            fetchSearchResults={fetchSearchResults}
                            selectedItem={state.selectedWorkflow}
                        />
                    </div>
                    <WaitForData
                        {...state.launchPlanOptionsLoadingState}
                        spinnerVariant="medium"
                    >
                        <div className={styles.formControl}>
                            <SearchableSelector
                                label="Launch Plan"
                                onSelectionChanged={state.onSelectLaunchPlan}
                                options={state.launchPlanSelectorOptions}
                                selectedItem={state.selectedLaunchPlan}
                            />
                        </div>
                    </WaitForData>
                </WaitForData>
            </DialogContent>
            <div className={styles.footer}>
                {!!submissionState.lastError && (
                    <FormHelperText error={true}>
                        {submissionState.lastError.message}
                    </FormHelperText>
                )}
                <DialogActions>
                    <Button
                        color="primary"
                        disabled={submissionState.loading}
                        id="launch-workflow-cancel"
                        onClick={state.onCancel}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        id="launch-workflow-submit"
                        onClick={submit}
                        type="submit"
                        variant="contained"
                    >
                        Import
                        {submissionState.loading && <ButtonCircularProgress />}
                    </Button>
                </DialogActions>
            </div>
        </>
    );
};
