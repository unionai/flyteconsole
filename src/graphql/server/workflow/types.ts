import { Identifier } from 'models/Common/types';
import { RequestConfig } from 'models/AdminEntity/types';

export type GetWorkflowArgs = {
    id: Identifier;
    config?: RequestConfig;
};
