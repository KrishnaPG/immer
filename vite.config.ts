import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [tailwindcss(), react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@/lib": path.resolve(__dirname, "./src/lib"),
			"@/components": path.resolve(__dirname, "./src/lib/components"),
			"@/geometry": path.resolve(__dirname, "./src/lib/geometry"),
			"@/interactions": path.resolve(__dirname, "./src/lib/interactions"),
			"@/animations": path.resolve(__dirname, "./src/lib/animations"),
			"@/state": path.resolve(__dirname, "./src/lib/state"),
			"@/styles": path.resolve(__dirname, "./src/styles"),
			"@/types": path.resolve(__dirname, "./src/types"),
		},
	},
	build: {
		lib: {
			entry: path.resolve(__dirname, "src/index.ts"),
			name: "immer",
			fileName: (format) => `index.${format}.js`,
		},
		rollupOptions: {
			external: ["react", "react-dom"],
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
				},
			},
		},
		sourcemap: true,
		target: "esnext",
		minify: "esbuild",
	},
});
