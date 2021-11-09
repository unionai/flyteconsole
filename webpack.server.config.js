const path = require('path');
const { DefinePlugin } = require('webpack');
const nodeExternals = require('webpack-node-externals');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');

require('dotenv').config();

const { NODE_ENV } = process.env;

module.exports = {
    entry: ['babel-polyfill', './server.ts'],
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            common: path.resolve(__dirname, 'src/common'),
            components: path.resolve(__dirname, 'src/components'),
            config: path.resolve(__dirname, 'src/config'),
            models: path.resolve(__dirname, 'src/models'),
            flyteidl: path.resolve(__dirname, 'src/flyteidl'),
            errors: path.resolve(__dirname, 'src/errors'),
            graphql: path.resolve(__dirname, 'src/graphql')
        }
    },
    watch: NODE_ENV === 'development',
    mode: NODE_ENV,
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'index.js',
        libraryTarget: 'commonjs2'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.ts$/,
                exclude: [/node_modules/, /components/, /routes/],
                use: [
                    'babel-loader',
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: './tsconfig.server.json',
                            transpileOnly: true
                        }
                    }
                ]
            }
        ]
    },
    externals: [nodeExternals({ whitelist: /@flyteorg/ })],
    plugins: [
        ...(NODE_ENV === 'development'
            ? [
                  new WebpackShellPluginNext({
                      onBuildEnd: {
                          scripts: ['yarn run:server'],
                          blocking: false,
                          parallel: true
                      }
                  })
              ]
            : []),
        new DefinePlugin({
            'process.env': JSON.stringify(process.env)
        })
    ]
};
