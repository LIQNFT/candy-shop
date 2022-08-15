const path = require("path")

module.exports = {
  paths: function (paths, env) {
    paths.appIndexJs = path.resolve(__dirname, "core/index.tsx")
    paths.appSrc = path.resolve(__dirname, "core")
    return paths
  },
}
