var webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackRootPlugin = require('html-webpack-root-plugin');
const path = require('path');


module.exports = (env, argv) => {
    return {
        entry: {
            "app": "./src/webpack.index.js",
        },
        output: {
            path: path.resolve(__dirname, 'public/assets'),
            filename: "[name]/webpack.bundle-[hash].js",
            publicPath: env && env.DEV_SERVER ? "/" : "/assets/",
        },
        devtool: argv.mode === 'development' ? 'source-map' : void 0,
        resolve: {
            alias: {
                vue: argv.mode === 'development' ? 'vue/dist/vue.js' : 'vue/dist/vue.min.js'
            },
        },
        module: {
            rules: [
/*
                {
                    enforce: "pre",
                    test: /\.js$/,
                    exclude: [
                        /node_modules/,
                        /geobuf-.*\.js/,
                        /sorttable\.js/,
                        /webpack.bundle.*\.js/
                    ],
                    loader: 'eslint-loader',
                    options: {
                        cache: true,
                    }
                },
*/
                { test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                },
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                    options: {
                        hotReload: env && env.DEV_SERVER
                    }
                },
                {
                    test: /\.css$/,
                    use: [
                        { loader: "style-loader" },
                        { loader: "css-loader" },
                    ]
                },
                { test: /\.png$/, loaders: ["base64-image-loader"] },
                { test: /\.gif$/, loaders: ["base64-image-loader"] },
                {
                    test: /\.po$/,
                    type: "json",
                    use: [{
                        loader: "po-loader",
                        options: {
                            format: "mf",
                            "fallback-to-msgid": true,
                        }
                    }]
                },
            ]
        },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    terserOptions: {
                        ecma: 6,
                    },
                }),
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "src/index.html",
                chunks: ["app"],
                inject: "body", // Inject all scripts into the body
                filename: "index.html"
            }),
            new HtmlWebpackRootPlugin("app"),
            new webpack.DefinePlugin({
                API_URL: JSON.stringify(env.API_URL)
            }),
            new VueLoaderPlugin(),
        ],
        devServer: {
            contentBase: "./public/assets/",
            historyApiFallback: true,
            open: true,
            openPage: "en/",
            compress: true,
            host: "0.0.0.0"
        },
    }
};
