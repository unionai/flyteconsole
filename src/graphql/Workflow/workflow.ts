import { request, gql } from 'graphql-request';
import { RequestConfig } from 'models/AdminEntity/types';
import { usePagination } from 'components/hooks/usePagination';
import { WorkflowListItem } from './types';
import { DomainIdentifierScope } from 'models/Common/types';
import axios, { AxiosTransformer } from 'axios';

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
                const {
                    data: {
                        data: { getWorkflows: data }
                    }
                } = await axios.post<{
                    data: {
                        getWorkflows: {
                            entities: WorkflowListItem[];
                            token: string;
                        };
                    };
                }>(
                    'https://localhost.demo.nuclyde.io/graphql',
                    {
                        query: gql`
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
                                                seconds
                                                nanos
                                            }
                                            compiledWorkflow {
                                                primary {
                                                    template {
                                                        interface {
                                                            inputs {
                                                                variables
                                                            }
                                                            outputs {
                                                                variables
                                                            }
                                                        }
                                                    }
                                                }
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
                                                    seconds
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
                                        description
                                    }
                                    token
                                }
                            }
                        `,
                        variables: {
                            id: scope,
                            config: requestConfig
                        }
                    },
                    {
                        // transformRequest: [...axios.defaults.transformRequest as AxiosTransformer[]],
                        withCredentials: true
                    }
                );
                console.log(data);
                return data;
            } catch (e) {
                console.log(e);
                return {
                    entities: [] as WorkflowListItem[],
                    token: ''
                };
            }
        }
    );
};
