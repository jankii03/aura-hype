import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import {
	ProductForm,
	type ProductFormData,
} from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/integrations/trpc/react";

export const Route = createFileRoute("/admin/products/new")({
	component: NewProductPage,
});

function NewProductPage() {
	const trpc = useTRPC();
	const navigate = useNavigate();

	const { mutate: createProduct, isPending } = useMutation({
		...trpc.products.create.mutationOptions(),
		onSuccess: () => {
			navigate({ to: "/admin/products" });
		},
		onError: (error) => {
			alert(`Failed to create product: ${error.message}`);
		},
	});

	const handleSubmit = (data: ProductFormData) => {
		createProduct({
			name: data.name,
			price: data.price,
			image: data.image,
			brand: data.brand,
			category: data.category || undefined,
			gender: data.gender || undefined,
			description: data.description || undefined,
			tags: data.tags.length > 0 ? data.tags : undefined,
			extraImages: data.extraImages.length > 0 ? data.extraImages : undefined,
		});
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto py-8 px-4 max-w-2xl">
				<div className="flex items-center gap-4 mb-8">
					<Button variant="ghost" size="icon" asChild>
						<Link to="/admin/products">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<h1 className="text-3xl font-bold">New Product</h1>
				</div>

				<ProductForm
					onSubmit={handleSubmit}
					isLoading={isPending}
					submitLabel="Create Product"
				/>
			</div>
		</div>
	);
}
