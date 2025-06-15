import { defineConfig } from 'vite';
import { glob } from 'glob';
import injectHTML from 'vite-plugin-html-inject';
import FullReload from 'vite-plugin-full-reload';
import SortCss from 'postcss-sort-media-queries';
import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss';

export default defineConfig(({ command }) => {
  return {
    define: {
      [command === 'serve' ? 'global' : '_global']: {},
    },
    root: 'src',
    base: '/script-ninjas-project/',
    build: {
      sourcemap: true,
      rollupOptions: {
        input: glob.sync('./src/*.html'),
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          entryFileNames: chunkInfo => {
            if (chunkInfo.name === 'commonHelpers') {
              return 'commonHelpers.js';
            }
            return '[name].js';
          },
          assetFileNames: assetInfo => {
            if (assetInfo.name && assetInfo.name.endsWith('.html')) {
              return '[name].[ext]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
      outDir: '../dist',
      emptyOutDir: true,
    },
    plugins: [injectHTML(), FullReload(['./src/**/**.html'])],
    css: {
      postcss: {
        plugins: [
          SortCss({
            sort: 'mobile-first',
          }),
          purgeCSSPlugin({
            // <-- Use purgeCSSPlugin here
            content: ['./index.html', './src/**/*.html', './src/**/*.js'],
            safelist: [
              'swiper-initialized',
              'swiper-slide-active',
              'swiper-slide-next',
              'swiper-slide-prev',
              'swiper-pagination-bullet',
              'swiper-pagination-bullet-active',
              'swiper-button-disabled',
              'swiper-wrapper',
              'swiper-container',
              'is-open',
              'is-active',
              'is-hidden',
            ],
          }),
        ],
      },
    },
  };
});
