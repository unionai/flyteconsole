import { makeExecutableSchema } from '@graphql-tools/schema';
import ServiceTypeDefs from './server/schema';
import ServiceResolvers from './server/resolver';

export const schema = makeExecutableSchema({
    typeDefs: ServiceTypeDefs,
    resolvers: ServiceResolvers
});
