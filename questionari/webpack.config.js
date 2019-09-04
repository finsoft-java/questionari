const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: './src/main.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ['ts-loader', 'angular2-template-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.(html|css)$/,
                loader: 'raw-loader'
            },
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@': path.resolve(__dirname, 'src/app/'),
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            inject: 'body'
        }),
        new webpack.DefinePlugin({
            // global app config object
            config: JSON.stringify({
                //apiUrl: 'http://192.168.99.100/ws',                                   //luca docker
                //apiUrl: 'http://localhost/ws',                                        //luca
                apiUrl: 'http://127.0.0.1/questionari/ws',                              // ale
                //websocketUrl: 'ws://192.168.99.100/ws/WebsocketChat.php'              //luca docker
                //websocketUrl: 'ws://localhost/ws/WebsocketChat.php'                   //luca
                websocketUrl: 'ws://127.0.0.1/questionari/ws/WebsocketChat.php'         //ale
            })
        })
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
        runtimeChunk: true
    },
    devServer: {
        historyApiFallback: true
    }
};