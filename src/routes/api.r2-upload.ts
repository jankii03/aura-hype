import { createFileRoute } from "@tanstack/react-router";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

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
		const env = (globalThis as any).cloudflare?.env || (globalThis as any);
		const bucket = env?.IMAGES;

		if (bucket) {
			// Production: Upload to R2
			const arrayBuffer = await file.arrayBuffer();
			await bucket.put(key, arrayBuffer, {
				httpMetadata: {
					contentType: file.type,
				},
			});
		} else {
			// Development: Save to local public/uploads folder
			const uploadsDir = join(process.cwd(), "public", "uploads");
			await mkdir(uploadsDir, { recursive: true });

			const arrayBuffer = await file.arrayBuffer();
			const filePath = join(uploadsDir, key);
			await writeFile(filePath, Buffer.from(arrayBuffer));

			console.log(`[Dev] Saved upload to: ${filePath}`);
		}

		return new Response(JSON.stringify({ key }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		console.error("Error uploading file:", error);
		return new Response("Error uploading file", { status: 500 });
	}
}

export const Route = createFileRoute("/api/r2-upload")({
	server: {
		handlers: {
			POST: handler,
		},
	},
});
