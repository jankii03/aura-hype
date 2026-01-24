import { createFileRoute, Link } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/")({
	component: AdminDashboard,
});

function AdminDashboard() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto py-8 px-4">
				<h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					<Link to="/admin/products">
						<Card className="hover:border-primary transition-colors cursor-pointer">
							<CardHeader className="flex flex-row items-center gap-4">
								<Package className="h-8 w-8" />
								<CardTitle>Products</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									Manage your product catalog. Add, edit, or remove products.
								</p>
							</CardContent>
						</Card>
					</Link>
				</div>
			</div>
		</div>
	);
}
