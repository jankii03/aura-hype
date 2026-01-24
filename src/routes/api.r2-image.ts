import { createFileRoute } from "@tanstack/react-router";

// API route to serve images from R2 storage
// Usage: /api/r2-image?key=[image-key]
// Example: /api/r2-image?key=00406430-6192-456e-9f34-724d5426e303.jpg

declare global {
	var IMAGES: R2Bucket | undefined;
}

interface R2Bucket {
	get(key: string): Promise<R2Object | null>;
}

interface R2Object {
	body: ReadableStream;
	etag: string;
	httpMetadata?: {
		contentType?: string;
	};
}

export const Route = createFileRoute("/api/r2-image")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				// Get the image key from query parameter
				const url = new URL(request.url);
				const imageKey = url.searchParams.get("key");

				if (!imageKey) {
					return new Response("Image key is required", { status: 400 });
				}

				try {
					// Access the R2 bucket binding (defined in wrangler.toml as IMAGES)
					const bucket = globalThis.IMAGES;

					if (!bucket) {
						console.error(
							"R2 bucket binding not found. Make sure IMAGES is configured in wrangler.toml",
						);
						return new Response("Storage not configured", { status: 500 });
					}

					// Fetch the object from R2
					const object = await bucket.get(imageKey);

					if (!object) {
						console.error(`Image not found in R2: ${imageKey}`);
						return new Response("Image not found", { status: 404 });
					}

					// Get the content type from R2 metadata or default to jpeg
					const contentType = object.httpMetadata?.contentType || "image/jpeg";

					// Return the image with appropriate headers
					return new Response(object.body, {
						status: 200,
						headers: {
							"Content-Type": contentType,
							"Cache-Control": "public, max-age=31536000, immutable",
							ETag: object.etag,
						},
					});
				} catch (error) {
					console.error("Error fetching image from R2:", error);
					return new Response("Error fetching image", { status: 500 });
				}
			},
		},
	},
});
