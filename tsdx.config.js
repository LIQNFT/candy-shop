const postcss = require('rollup-plugin-postcss');
const svg = require('rollup-plugin-svg-import');
const image = require('@rollup/plugin-image');

module.exports = {
  rollup(config, options) {
    config.plugins.push(
      ...[
        postcss({
          inject: true,
          less: true,
          use: [['less', { javascriptEnabled: true }]],
        }),
        image(),
        svg({
          stringify: false,
        }),
      ]
    );

    return config;
  },
};
