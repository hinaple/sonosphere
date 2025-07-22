import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import renderer from "vite-plugin-electron-renderer";

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()],
    },
    renderer: {
        plugins: [renderer()],
    },
});
