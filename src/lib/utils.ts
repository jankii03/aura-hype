import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getImageUrl(r2Key: string) {
	const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
	if (r2PublicUrl) {
		return `${r2PublicUrl}/${r2Key}`;
	}
	// In development, check if it's a local upload (UUID format)
	// Local uploads are served from /uploads/
	if (import.meta.env.DEV) {
		return `/uploads/${r2Key}`;
	}
	return `/api/r2-image/${encodeURIComponent(r2Key)}`;
}
