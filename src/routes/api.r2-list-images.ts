import { createFileRoute } from "@tanstack/react-router";

// API route to list all images from R2 storage
// Usage: GET /api/r2-list-images
// Optional query params:
//   - prefix: filter by prefix (e.g., "louis-vuitton/")
//   - limit: max number of items (default: 1000)

declare global {
	var IMAGES: R2Bucket | undefined;
}

interface R2Bucket {
	get(key: string): Promise<R2Object | null>;
	list(options?: R2ListOptions): Promise<R2Objects>;
}

interface R2ListOptions {
	prefix?: string;
	cursor?: string;
	limit?: number;
	delimiter?: string;
}

interface R2Object {
	key: string;
	size: number;
	etag: string;
	uploaded: Date;
	httpMetadata?: {
		contentType?: string;
	};
}

interface R2Objects {
	objects: R2Object[];
	truncated: boolean;
	cursor?: string;
	delimitedPrefixes: string[];
}

export const Route = createFileRoute("/api/r2-list-images")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);
				const prefix = url.searchParams.get("prefix") || undefined;
				const limit = parseInt(url.searchParams.get("limit") || "1000", 10);

				try {
					// Access the R2 bucket binding - match pattern from db.server.ts
					const getR2Bucket = () => {
						// Cloudflare Pages style
						const cfEnv = (globalThis as any).cloudflare?.env;
						if (cfEnv?.IMAGES) {
							return cfEnv.IMAGES;
						}
						// Direct Workers binding on globalThis
						if (typeof (globalThis as any).IMAGES !== "undefined") {
							return (globalThis as any).IMAGES;
						}
						return undefined;
					};
					const bucket = getR2Bucket();

					if (!bucket) {
						console.error(
							"R2 bucket binding not found. Make sure IMAGES is configured in wrangler.toml",
						);
						return new Response(
							JSON.stringify({ error: "Storage not configured" }),
							{
								status: 500,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					// Fetch all objects from R2, handling pagination
					const allObjects: R2Object[] = [];
					let cursor: string | undefined;
					let truncated = true;

					while (truncated) {
						const listed: R2Objects = await bucket.list({
							prefix,
							cursor,
							limit: Math.min(limit - allObjects.length, 1000), // R2 max is 1000 per request
						});

						allObjects.push(...listed.objects);
						truncated = listed.truncated && allObjects.length < limit;
						cursor = listed.cursor;
					}

					// Filter for image files only
					const imageExtensions = [
						".jpg",
						".jpeg",
						".png",
						".gif",
						".webp",
						".avif",
						".svg",
					];
					const imageObjects = allObjects.filter((obj) =>
						imageExtensions.some((ext) => obj.key.toLowerCase().endsWith(ext)),
					);

					// Generate the products array format
					const products = imageObjects.map((obj, index) => ({
						id: index + 1,
						name: generateProductName(obj.key),
						price: "$0", // You'll need to update prices manually
						image: obj.key,
						size: obj.size,
						uploaded: obj.uploaded,
					}));

					// Also return the raw code snippet that can be copy-pasted
					const codeSnippet = generateCodeSnippet(products);

					return new Response(
						JSON.stringify(
							{
								total: products.length,
								products,
								codeSnippet,
							},
							null,
							2,
						),
						{
							status: 200,
							headers: { "Content-Type": "application/json" },
						},
					);
				} catch (error) {
					console.error("Error listing R2 objects:", error);
					return new Response(
						JSON.stringify({
							error: "Failed to list images",
							details: error instanceof Error ? error.message : "Unknown error",
						}),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			},
		},
	},
});

// Generate a human-readable product name from the file key
function generateProductName(key: string): string {
	// Remove file extension
	const nameWithoutExt = key.replace(/\.[^/.]+$/, "");

	// If it's a UUID-style name, return a placeholder
	const uuidPattern =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	if (uuidPattern.test(nameWithoutExt)) {
		return "Product Name (Update Me)";
	}

	// Convert kebab-case or snake_case to Title Case
	return nameWithoutExt
		.replace(/[-_]/g, " ")
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

// Generate copy-pasteable TypeScript code
function generateCodeSnippet(
	products: Array<{ id: number; name: string; price: string; image: string }>,
): string {
	const items = products
		.map(
			(p) => `    {
      id: ${p.id},
      name: '${p.name.replace(/'/g, "\\'")}',
      price: '${p.price}',
      image: '${p.image}',
    }`,
		)
		.join(",\n");

	return `const products = [
${items}
  ]`;
}
