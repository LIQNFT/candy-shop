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
        svg({
          stringify: false,
        }),
      ]
    );

    config.plugins.unshift(image());

    return config;
  },
};
