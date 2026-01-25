import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import * as schema from "./db/schema";

// Get D1 database binding from Cloudflare environment
const getD1 = () => {
	// Cloudflare Pages puts bindings under globalThis.cloudflare.env
	const cfEnv = (globalThis as any).cloudflare?.env;
	if (cfEnv?.DB) {
		return cfEnv.DB;
	}
	// Fallback for direct Workers binding
	if (typeof (globalThis as any).DB !== "undefined") {
		return (globalThis as any).DB;
	}
	return undefined;
};

// Cached database instance
let d1Db: ReturnType<typeof drizzleD1> | null = null;

// Lazy initialization to ensure bindings are available at request time
export const getDb = () => {
	const d1 = getD1();
	if (d1) {
		// Production: Use D1
		if (!d1Db) {
			d1Db = drizzleD1(d1, { schema });
		}
		return d1Db;
	}

	// Development fallback - this will only work when NOT on Cloudflare
	// The import is at the top level because we need it for local dev
	throw new Error(
		"D1 database not available. Are you running in local development mode? " +
			"Use 'pnpm dev' instead of the Cloudflare build for local development.",
	);
};

// Export schema for convenience
export { schema };
export type Database = ReturnType<typeof getDb>;
