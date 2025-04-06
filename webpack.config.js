const path = require("path");

module.exports = {
  entry: [
    "./out/services/decorate.js",
    "./out/services/generate-card-list.js",
    "./out/services/create-nav-bar.js",
  ],
  output: {
    path: path.resolve(__dirname, "out/dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
};
