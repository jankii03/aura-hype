import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { TRPCRouter } from "@/integrations/trpc/router";
import { Provider } from "@/integrations/tanstack-query/root-provider";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;

	trpc: TRPCOptionsProxy<TRPCRouter>;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Aura Hype",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	component: RootComponent,
	shellComponent: RootDocument,
});

function RootComponent() {
	const { queryClient } = Route.useRouteContext();
	return (
		<Provider queryClient={queryClient}>
			<Outlet />
		</Provider>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
