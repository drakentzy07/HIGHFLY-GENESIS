import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({base:'./',build:{outDir:'site',target:'es2022',rollupOptions:{input:{game:resolve('index.html'),editor:resolve('editor.html')}}},server:{host:true}});
