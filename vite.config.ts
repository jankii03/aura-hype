import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig(() => ({
	plugins: [
		nitro(),
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
		{
			name: "exclude-db-from-client",
			enforce: "pre",
			resolveId(id, importer, options) {
				// Only exclude from client builds, not SSR builds
				// Check both the ssr option and if it's a browser entry
				const isSSR = options?.ssr === true;
				const isClientEntry = importer?.includes("client-entry") || false;

				if (!isSSR && isClientEntry && id.includes("db.server")) {
					return "\0virtual:db-stub";
				}
				return null;
			},
			load(id) {
				if (id === "\0virtual:db-stub") {
					return "export const getDb = () => null; export const schema = {}; export default {};";
				}
				return null;
			},
		},
	],
	define: {
		"process.env": {},
		"import.meta.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
	},
	ssr: {
		noExternal: ["@tanstack/router-core"],
	},
	build: {
		rollupOptions: {
			// Bundle everything for Cloudflare
		},
	},
}));

export default config;
