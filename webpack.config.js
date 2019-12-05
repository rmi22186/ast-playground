const path = require('path');

module.exports = {
    entry: './index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    // node: {
    //     fs: 'empty'
    // },
    optimization: {
        minimize: true,
    },
    resolve: {
        symlinks: false,
    },
    mode: 'production',
    performance: { hints: false },
    // sourceMaps: true
    // devtool: 'source-map',
    // devServer: {
    // },
};
