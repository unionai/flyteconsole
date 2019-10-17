import { workflowTabIds } from 'common/constants';
import { ensureSlashPrefixed } from 'common/utils';
import { TaskExecutionIdentifier, WorkflowExecutionIdentifier } from 'models';
import * as queryString from 'query-string';
import {
    projectBasePath,
    projectDomainBasePath,
    taskExecutionPath
} from './constants';
import { Query } from './types';
import { makeRoute } from './utils';

/** Creates a path relative to a particular project */
export const makeProjectBoundPath = (
    projectId: string,
    path: string = '',
    queryParams: Query = {}
) => {
    let route = `/projects/${projectId}${
        path.length ? ensureSlashPrefixed(path) : path
    }`;
    if (queryParams) {
        const qString = queryString.stringify(queryParams);
        route = route.concat('?', qString);
    }
    return makeRoute(route);
};

/** Creates a path relative to a particular project and domain. Paths should begin with a slash (/) */
export const makeProjectDomainBoundPath = (
    projectId: string,
    domainId: string,
    path: string = '',
    queryParams: Query = {}
) => {
    let route = `/projects/${projectId}/domains/${domainId}${path}`;
    if (queryParams) {
        const qString = queryString.stringify(queryParams);
        route = route.concat('?', qString);
    }
    return makeRoute(route);
};

export class Routes {
    static NotFound = {};
    // Projects
    static ProjectDetails = {
        makeUrl: (project: string, section?: string) =>
            makeProjectBoundPath(project, section ? `/${section}` : ''),
        path: projectBasePath,
        sections: {
            workflows: {
                makeUrl: (project: string, domain?: string, host?: string) => {
                    const queryParams: Query = {};
                    if (domain) {
                        queryParams['domain'] = domain;
                    }
                    if (host) {
                        queryParams['host'] = host;
                    }
                    return makeProjectBoundPath(
                        project,
                        `/workflows`,
                        queryParams
                    );
                },
                path: `${projectBasePath}/workflows`
            }
        }
    };
    static ProjectExecutions = {
        makeUrl: (project: string, domain: string) =>
            makeProjectDomainBoundPath(project, domain, '/executions'),
        path: `${projectDomainBasePath}/executions`
    };
    static ProjectLaunchPlans = {
        makeUrl: (project: string, domain: string) =>
            makeProjectDomainBoundPath(project, domain, '/launchplans'),
        path: `${projectDomainBasePath}/launchplans`
    };
    static ProjectSchedules = {
        makeUrl: (project: string, domain: string) =>
            makeProjectDomainBoundPath(project, domain, '/schedules'),
        path: `${projectDomainBasePath}/schedules`
    };
    static ProjectWorkflows = {
        makeUrl: (project: string, domain: string) =>
            makeProjectDomainBoundPath(project, domain, '/workflows'),
        path: `${projectDomainBasePath}/workflows`
    };

    // Workflows
    static WorkflowDetails = {
        makeUrl: (
            project: string,
            domain: string,
            workflowName: string,
            host?: string
        ) => {
            const queryParams: Query = {};
            if (host) {
                queryParams['host'] = host;
            }
            return makeProjectDomainBoundPath(
                project,
                domain,
                `/workflows/${workflowName}`,
                queryParams
            );
        },
        path: `${projectDomainBasePath}/workflows/:workflowName`,
        Executions: {
            makeUrl: (project: string, domain: string, workflowName: string) =>
                makeProjectDomainBoundPath(
                    project,
                    domain,
                    `/workflows/${workflowName}/${workflowTabIds.executions}`
                ),
            path: `${projectDomainBasePath}/workflows/:workflowName/${
                workflowTabIds.executions
            }`
        },
        Versions: {
            makeUrl: (project: string, domain: string, workflowName: string) =>
                makeProjectDomainBoundPath(
                    project,
                    domain,
                    `/workflows/${workflowName}/${workflowTabIds.versions}`
                ),
            path: `${projectDomainBasePath}/workflows/:workflowName/${
                workflowTabIds.versions
            }`
        },
        LaunchPlans: {
            makeUrl: (project: string, domain: string, workflowName: string) =>
                makeProjectDomainBoundPath(
                    project,
                    domain,
                    `/workflows/${workflowName}/${workflowTabIds.launchPlans}`
                ),
            path: `${projectDomainBasePath}/workflows/:workflowName/${
                workflowTabIds.launchPlans
            }`
        },
        Schedules: {
            makeUrl: (project: string, domain: string, workflowName: string) =>
                makeProjectDomainBoundPath(
                    project,
                    domain,
                    `/workflows/${workflowName}/${workflowTabIds.schedules}`
                ),
            path: `${projectDomainBasePath}/workflows/:workflowName/${
                workflowTabIds.schedules
            }`
        }
    };

    static WorkflowVersionDetails = {
        makeUrl: (
            project: string,
            domain: string,
            workflowName: string,
            version: string
        ) =>
            makeProjectDomainBoundPath(
                project,
                domain,
                `/workflows/${workflowName}/version/${version}`
            ),
        path: `${projectDomainBasePath}/workflows/:workflowName/version/:version`
    };

    // Executions
    static ExecutionDetails = {
        makeUrl: ({ domain, name, project }: WorkflowExecutionIdentifier) =>
            makeProjectDomainBoundPath(project, domain, `/executions/${name}`),
        path: `${projectDomainBasePath}/executions/:executionId`
    };
    static TaskExecutionDetails = {
        makeUrl: (taskExecutionId: TaskExecutionIdentifier) => {
            const {
                nodeExecutionId: {
                    executionId: { project, domain, name: executionName },
                    nodeId
                },
                taskId: {
                    project: taskProject,
                    domain: taskDomain,
                    name: taskName,
                    version: taskVersion
                },
                retryAttempt
            } = taskExecutionId;
            return makeProjectDomainBoundPath(
                project,
                domain,
                `/task_executions/${executionName}/${nodeId}/${taskProject}/${taskDomain}/${taskName}/${taskVersion}/${retryAttempt}`
            );
        },
        path: taskExecutionPath
    };

    // Landing page
    static SelectProject = {
        path: makeRoute('/')
    };
}
