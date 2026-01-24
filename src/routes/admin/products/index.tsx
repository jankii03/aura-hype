import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { ProductTable } from "@/components/admin/ProductTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { brandNames } from "@/data/all-brands";
import { useTRPC } from "@/integrations/trpc/react";

export const Route = createFileRoute("/admin/products/")({
	component: ProductsPage,
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery(
			context.trpc.products.list.queryOptions(),
		);
	},
});

function ProductsPage() {
	const trpc = useTRPC();
	const [search, setSearch] = useState("");
	const [brand, setBrand] = useState<string>("");

	const { data: products = [], refetch } = useQuery(
		trpc.products.list.queryOptions({
			search: search || undefined,
			brand: brand || undefined,
		}),
	);

	const [deletingId, setDeletingId] = useState<number | null>(null);
	const { mutate: deleteProduct } = useMutation({
		...trpc.products.delete.mutationOptions(),
		onMutate: (variables) => {
			setDeletingId(variables.id);
		},
		onSuccess: () => {
			refetch();
			setDeletingId(null);
		},
		onError: () => {
			setDeletingId(null);
		},
	});

	const handleDelete = (id: number) => {
		if (confirm("Are you sure you want to delete this product?")) {
			deleteProduct({ id });
		}
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto py-8 px-4">
				<div className="flex items-center gap-4 mb-8">
					<Button variant="ghost" size="icon" asChild>
						<Link to="/admin">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<h1 className="text-3xl font-bold">Products</h1>
				</div>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle>Filters</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col md:flex-row gap-4">
							<Input
								placeholder="Search by name..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="md:w-64"
							/>
							<Select value={brand} onValueChange={setBrand}>
								<SelectTrigger className="md:w-48">
									<SelectValue placeholder="All brands" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All brands</SelectItem>
									{brandNames.map((b) => (
										<SelectItem key={b} value={b}>
											{b}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{(search || brand) && (
								<Button
									variant="outline"
									onClick={() => {
										setSearch("");
										setBrand("");
									}}
								>
									Clear filters
								</Button>
							)}
							<div className="flex-1" />
							<Button asChild>
								<Link to="/admin/products/new">
									<Plus className="h-4 w-4 mr-2" />
									Add Product
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<ProductTable
							products={products}
							onDelete={handleDelete}
							isDeleting={deletingId}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
