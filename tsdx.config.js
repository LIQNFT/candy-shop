const postcss = require('rollup-plugin-postcss');
module.exports = {
  rollup(config, options) {
    config.plugins.push(
      postcss({
        inject: true,
        less: true,
        use: [['less', { javascriptEnabled: true }]],
      })
    );
    return config;
  },
};
