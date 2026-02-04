import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchStreamLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";
import { TRPCProvider } from "@/integrations/trpc/react";
import type { TRPCRouter } from "@/integrations/trpc/router";

export const trpcClient = createTRPCClient<TRPCRouter>({
	links: [
		httpBatchStreamLink({
			transformer: superjson,
			// Use relative URL - works on both client and server when SSR prefetch is skipped
			url: "/api/trpc",
		}),
	],
});

// Helper to check if we're on Cloudflare (for skipping SSR prefetch)
// On Cloudflare, we can't make HTTP requests to ourselves during SSR
export const isCloudflare = () => {
	if (typeof window !== "undefined") return false;
	// Check for Cloudflare-specific globals
	const g = globalThis as any;
	// navigator.userAgent contains "Cloudflare-Workers" on Cloudflare
	const isWorker = typeof navigator !== "undefined" &&
		navigator.userAgent?.includes("Cloudflare-Workers");
	// Also check for cloudflare env or __env__ patterns
	return isWorker || !!(g.cloudflare?.env || g.__env__);
};

export function getContext() {
	const queryClient = new QueryClient({
		defaultOptions: {
			dehydrate: { serializeData: superjson.serialize },
			hydrate: { deserializeData: superjson.deserialize },
		},
	});

	const serverHelpers = createTRPCOptionsProxy({
		client: trpcClient,
		queryClient: queryClient,
	});
	return {
		queryClient,
		trpc: serverHelpers,
	};
}

export function Provider({
	children,
	queryClient,
}: {
	children: React.ReactNode;
	queryClient: QueryClient;
}) {
	return (
		<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
			{children}
		</TRPCProvider>
	);
}
