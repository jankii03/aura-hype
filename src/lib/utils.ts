import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getImageUrl(r2Key: string) {
	const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL;

	// In development, check if it's a local upload (UUID format)
	// Local uploads are served from /uploads/
	const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\./i.test(r2Key);
	if (import.meta.env.DEV && isUUID) {
		return `/uploads/${r2Key}`;
	}

	if (r2PublicUrl) {
		return `${r2PublicUrl}/${r2Key}`;
	}

	return `/api/r2-image/${encodeURIComponent(r2Key)}`;
}
