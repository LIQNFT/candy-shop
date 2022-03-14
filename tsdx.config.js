const postcss = require('rollup-plugin-postcss');
const svg = require('rollup-plugin-svg-import');
const image = require('@rollup/plugin-image');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');

module.exports = {
  rollup(config, options) {
    config.plugins.push(
      ...[
        commonjs(),
        nodeResolve({
          browser: true,
          extensions: [".js", ".ts"],
          dedupe: ["bn.js", "buffer"],
          preferBuiltins: false,
        }),
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
