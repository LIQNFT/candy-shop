import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import inject from '@rollup/plugin-inject';
import image from '@rollup/plugin-image';
import commonjs from '@rollup/plugin-commonjs';
//@ts-ignore
import { peerDependencies, dependencies } from './package.json';

const path = require('path');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    inject({
      Buffer: ['buffer', 'Buffer'],
    }),
    image(),
    commonjs()
  ],
  define: {
    global: {},
    'process.env.NODE_DEBUG': JSON.stringify(''),
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/index.tsx'),
      name: '@liqnft/candy-shop',
      fileName: (format) => `candy-shop.${format}.js`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [...Object.keys(peerDependencies), ...Object.keys(dependencies)],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: 'React',
        },
      },
    },
    sourcemap: true
  },
});
