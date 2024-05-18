import { resolve } from 'path';
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import react from "@vitejs/plugin-react";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                debug: resolve(__dirname, 'debug/index.html'),
                game: resolve(__dirname, 'game/index.html')
            }
        }
    },
    plugins: [react(), wasm(), topLevelAwait()],
});