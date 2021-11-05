import * as express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'https';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as fs from 'fs';
import { schema } from './src/graphql/schema';

require('dotenv').config();

const PORT = process.env.PORT || 443;

async function startApolloServer() {
    const app = express();

    app.use(
        cors({
            origin: 'https://demo.nuclyde.io',
            methods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS'],
            credentials: true
        })
    );
    app.use(cookieParser());

    const server = new ApolloServer({
        schema,
        introspection: true,
        context: ({ req, res }) => {
            const token = req.headers.authorization || '';
            console.log(req.cookies);
            const user = token;
            // if (!user) {
            //     throw new AuthenticationError('Unauthenticated');
            // }
            return { user, headers: req.headers };
        }
    });

    await server.start();

    server.applyMiddleware({
        app,
        path: '/graphql',
        cors: false
    });

    const privateKey = fs.readFileSync('script/server.key');
    const certificate = fs.readFileSync('script/server.crt');

    const httpsServer = createServer(
        {
            key: privateKey,
            cert: certificate
        },
        app
    );

    await new Promise(resolve => httpsServer.listen(PORT, () => resolve(null)));
    console.log(
        `🚀 GraphQL-Server is running on http://localhost:${PORT}/graphql`
    );
}

startApolloServer();
