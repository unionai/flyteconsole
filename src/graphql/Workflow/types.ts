import { WorkflowClosure, WorkflowId } from 'models/Workflow/types';
import { Execution } from 'models/Execution/types';

export type WorkflowListItem = {
    id: WorkflowId;
    closure: WorkflowClosure;
    lastExecutions: Execution[];
};
