import { Admin } from 'flyteidl';
import {
    defaultPaginationConfig,
    getAdminEntity,
    postAdminEntity,
    RequestConfig
} from 'models/AdminEntity';
import {
    endpointPrefixes,
    Identifier,
    IdentifierScope,
    makeIdentifierPath
} from 'models/Common';

import { Task } from './types';
import { taskListTransformer } from './utils';

/** Fetches a list of `Task` records matching the provided `scope` */
export const listTasks = (scope: IdentifierScope, config?: RequestConfig) =>
    getAdminEntity(
        {
            path: makeIdentifierPath(endpointPrefixes.task, scope),
            messageType: Admin.TaskList,
            transform: taskListTransformer
        },
        { ...defaultPaginationConfig, ...config }
    );

/** Fetches an individual `Task` record */
export const getTask = (id: Identifier, config?: RequestConfig) =>
    getAdminEntity<Admin.Task, Task>(
        {
            path: makeIdentifierPath(endpointPrefixes.task, id),
            messageType: Admin.Task
        },
        config
    );

export const createTask = (taskTemplate, config?: RequestConfig) =>
    postAdminEntity<Admin.ITaskCreateRequest, Admin.TaskCreateResponse>(
        {
            data: {
                id: taskTemplate.id,
                spec: {
                    template: taskTemplate
                }
            },
            path: endpointPrefixes.task,
            requestMessageType: Admin.TaskCreateRequest,
            responseMessageType: Admin.TaskCreateResponse
        },
        config
    );
