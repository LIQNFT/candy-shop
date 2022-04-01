import pluginTypescript from '@rollup/plugin-typescript';
import pluginCommonjs from '@rollup/plugin-commonjs';
import pluginNodeResolve from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import { babel } from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import svg from 'rollup-plugin-svg-import';
import image from '@rollup/plugin-image';
import json from '@rollup/plugin-json';
import * as path from 'path';
import pkg from './package.json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

const moduleName = pkg.name.replace(/^@.*\//, '');
const inputFileName = 'src/index.tsx';
const author = pkg.author;
const banner = `
  /**
   * @license
   * author: ${author}
   * ${moduleName}.js v${pkg.version}
   * Released under the ${pkg.license} license.
   */
`;

export default [
  // GLOBAL css for Storybook
  // {
  //   input: 'src/index.less',
  //   output: [
  //     {
  //       file: 'dist/index.css',
  //     },
  //   ],
  //   plugins: [
  //     postcss({
  //       extract: true,
  //       use: [['less', { javascriptEnabled: true }]],
  //     }),
  //   ],
  // },

  // ES
  {
    input: inputFileName,
    output: [
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: 'inline',
        banner,
      },
    ],
    plugins: [
      peerDepsExternal(),
      pluginCommonjs({
        extensions: ['.js', '.ts'],
      }),
      nodePolyfills(),
      pluginNodeResolve({
        browser: true,
      }),
      babel({
        babelHelpers: 'bundled',
        configFile: path.resolve(__dirname, '.babelrc.js'),
      }),
      pluginTypescript({
        tsconfig: './tsconfig.json',
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
      json(),
    ],
  },

  // CommonJS
  {
    input: inputFileName,
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        banner,
      },
    ],
    plugins: [
      peerDepsExternal(),
      pluginCommonjs({
        extensions: ['.js', '.ts'],
      }),
      nodePolyfills(),
      pluginNodeResolve({
        browser: true,
      }),
      babel({
        babelHelpers: 'bundled',
        configFile: path.resolve(__dirname, '.babelrc.js'),
      }),
      pluginTypescript({
        tsconfig: './tsconfig.json',
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
      json(),
    ],
  },
];
