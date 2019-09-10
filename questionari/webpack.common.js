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
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
        runtimeChunk: true
    }
};