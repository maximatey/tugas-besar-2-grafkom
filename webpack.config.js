const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/index.ts",
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        alias: {

        },
    },
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "public"),
    },
    devServer: {
        static: {
            directory: path.join(__dirname, "public"),
        },
        compress: true,
        port: 8000,
    },
};