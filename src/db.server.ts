import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibSQL } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
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

// Cached local database instance
let localDb: ReturnType<typeof drizzleLibSQL> | null = null;

// Lazy initialization to ensure bindings are available at request time
export const getDb = () => {
	const d1 = getD1();
	if (d1) {
		// Production: Use D1
		return drizzleD1(d1, { schema });
	}

	// Development: Use local SQLite via libsql
	if (!localDb) {
		const client = createClient({
			url: "file:./prisma/dev.db",
		});
		localDb = drizzleLibSQL(client, { schema });
	}
	return localDb;
};

// Export schema for convenience
export { schema };
export type Database = ReturnType<typeof getDb>;
