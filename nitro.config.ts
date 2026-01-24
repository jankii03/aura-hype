import { defineNitroConfig } from "nitro/config";

// Use NITRO_PRESET env var to override for deployment (e.g., NITRO_PRESET=cloudflare-pages)
export default defineNitroConfig({
	preset: process.env.NITRO_PRESET || "node-server",
});
