import path from 'path';
import { defineConfig } from 'vite';

const rootDir = typeof import.meta.dirname !== 'undefined' ? import.meta.dirname : path.resolve();

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(rootDir, 'index.html'),
        shop: path.resolve(rootDir, 'shop/index.html'),
        boots: path.resolve(rootDir, 'boots/index.html'),
        bootsExotic: path.resolve(rootDir, 'boots/exotic/index.html'),
        bootsWestern: path.resolve(rootDir, 'boots/western/index.html'),
        bootsWork: path.resolve(rootDir, 'boots/work/index.html'),
        clothing: path.resolve(rootDir, 'clothing/index.html'),
        frClothing: path.resolve(rootDir, 'fr-clothing/index.html'),
        accessories: path.resolve(rootDir, 'accessories/index.html'),
        about: path.resolve(rootDir, 'about/index.html'),
        contact: path.resolve(rootDir, 'contact/index.html'),
        faq: path.resolve(rootDir, 'faq/index.html'),
        product: path.resolve(rootDir, 'product/index.html'),
      },
    },
  },
  server: {
    port: 3000,
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
