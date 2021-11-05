import { ApolloError, UserInputError } from 'apollo-server-errors';
import { listExecutions } from 'models/Execution/api';
import { listWorkflows } from 'models/Workflow/api';
import { getNamedEntity, GetNamedEntityInput } from 'models/Common/api';
import { executionSortFields } from 'models/Execution/constants';
import { SortDirection, FilterOperationName } from 'models/AdminEntity/types';
import { GetWorkflowArgs } from './types';

const resolvers = {
    Query: {
        getWorkflows: async (_: any, args: GetWorkflowArgs, context: any) => {
            try {
                const { headers } = context;
                const { id, config } = args;
                if (!id) {
                    throw new UserInputError('Invalid id!');
                }
                const { entities: workflows, token } = await listWorkflows(
                    id,
                    config
                );

                console.log(workflows);

                const metadatas = await Promise.all(
                    workflows.map(async ({ id }) => {
                        const { domain, project, name } = id;
                        const {
                            metadata: { description }
                        } = await getNamedEntity(id as GetNamedEntityInput);
                        const executions = await listExecutions(
                            { domain, project },
                            {
                                sort: {
                                    key: executionSortFields.createdAt,
                                    direction: SortDirection.DESCENDING
                                },
                                filter: [
                                    {
                                        key: 'workflow.name',
                                        operation: FilterOperationName.EQ,
                                        value: name
                                    }
                                ],
                                limit: 10
                            }
                        );

                        return {
                            executions: executions.entities,
                            description
                        };
                    })
                );
                return {
                    entities: workflows.map((workflow, idx) => {
                        const {
                            executions: lastExecutions,
                            description
                        } = metadatas[idx];
                        return {
                            ...workflow,
                            lastExecutions,
                            description
                        };
                    }),
                    token
                };
            } catch (error) {
                console.log(error);
                throw new ApolloError(error as string);
            }
        }
    }
};

export default resolvers;
