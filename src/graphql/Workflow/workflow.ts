import { request, gql } from 'graphql-request';
import { RequestConfig } from 'models/AdminEntity/types';
import { usePagination } from 'components/hooks/usePagination';
import { WorkflowListItem } from './types';
import { DomainIdentifierScope } from 'models/Common/types';

export const GetWorkflowList = (
    project: string,
    domain: string,
    config?: RequestConfig
) => {
    return usePagination<WorkflowListItem, DomainIdentifierScope>(
        {
            ...config,
            fetchArg: {
                project,
                domain
            }
        },
        async (scope, requestConfig) => {
            try {
                const { getWorkflows: data } = await request(
                    'http://localhost:4000/graphql',
                    gql`
                        query(
                            $id: IdentifierInput!
                            $config: RequestConfigInput
                        ) {
                            getWorkflows(id: $id, config: $config) {
                                entities {
                                    id {
                                        project
                                        domain
                                        name
                                        version
                                        resourceType
                                    }
                                    closure {
                                        createdAt {
                                            seconds {
                                                high
                                                low
                                                unsigned
                                            }
                                            nanos
                                        }
                                    }
                                    lastExecutions {
                                        id {
                                            project
                                            domain
                                            name
                                        }
                                        closure {
                                            createdAt {
                                                nanos
                                            }
                                            computedInputs {
                                                literals
                                            }
                                            duration {
                                                nanos
                                            }
                                            phase
                                        }
                                        spec {
                                            authRole {
                                                assumableIamRole
                                                kubernetesServiceAccount
                                            }
                                            inputs {
                                                literals
                                            }
                                            disableAll
                                            maxParallelism
                                            labels {
                                                values
                                            }
                                        }
                                    }
                                }
                                token
                            }
                        }
                    `,
                    {
                        id: scope,
                        config: requestConfig
                    }
                );
                console.log(data);
                return data;
            } catch (e) {
                console.log(e);
                return {
                    entities: null,
                    token: 0
                };
            }
        }
    );
};
