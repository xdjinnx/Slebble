module.exports = {
    entry: './js/app.js',

    output: {
        filename: 'gae-root/webconfig/scripts/app.js',
        publicPath: 'gae-root/webconfig/'
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader?presets[]=es2015&presets[]=react'
            }
        ]
    }
}