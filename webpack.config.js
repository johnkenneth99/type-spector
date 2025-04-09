import path from "path";

/** TODO - Add env file for modes. */
/**
 * @type {import("webpack").Configuration}
 */
const config = {
  entry: ["./out/services/decorate.js", "./out/services/create-nav-bar.js"],
  mode: "development",
  watch: true,
  output: {
    path: path.resolve("out/dist"),
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

export default config;
