import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

async function handler({ request }: { request: Request }) {
	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get("file") as File | null;

		if (!file) {
			return new Response("No file provided", { status: 400 });
		}

		if (!ALLOWED_TYPES.includes(file.type)) {
			return new Response(
				`Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`,
				{ status: 400 },
			);
		}

		// Generate a UUID filename with the original extension
		const extension = file.name.split(".").pop() || "jpg";
		const key = `${crypto.randomUUID()}.${extension}`;

		// Access the R2 bucket binding
		const g = globalThis as any;
		const bucket =
			g.cloudflare?.env?.IMAGES ||
			g.__env__?.IMAGES ||
			g.IMAGES;

		if (!bucket) {
			const envKeys = Object.keys(g.cloudflare?.env || {});
			return new Response(
				JSON.stringify({
					error: "R2 bucket binding not found",
					availableBindings: envKeys,
				}),
				{ status: 500, headers: { "Content-Type": "application/json" } },
			);
		}

		const arrayBuffer = await file.arrayBuffer();
		await bucket.put(key, arrayBuffer, {
			httpMetadata: {
				contentType: file.type,
			},
		});

		return new Response(JSON.stringify({ key }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}

export const Route = createFileRoute("/api/r2-upload")({
	server: {
		handlers: {
			POST: handler,
		},
	},
});
