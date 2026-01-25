import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
	ProductForm,
	type ProductFormData,
} from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import { isCloudflare } from "@/integrations/tanstack-query/root-provider";
import { useTRPC } from "@/integrations/trpc/react";

export const Route = createFileRoute("/admin/products/$productId")({
	component: EditProductPage,
	loader: async ({ context, params }) => {
		// Skip SSR prefetching on Cloudflare - client will fetch after hydration
		if (isCloudflare()) {
			return;
		}
		await context.queryClient.prefetchQuery(
			context.trpc.products.byId.queryOptions({ id: Number(params.productId) }),
		);
	},
});

function EditProductPage() {
	const { productId } = Route.useParams();
	const trpc = useTRPC();
	const navigate = useNavigate();

	const { data: product, isLoading } = useQuery(
		trpc.products.byId.queryOptions({ id: Number(productId) }),
	);

	const { mutate: updateProduct, isPending } = useMutation({
		...trpc.products.update.mutationOptions(),
		onSuccess: () => {
			navigate({ to: "/admin/products" });
		},
		onError: (error) => {
			alert(`Failed to update product: ${error.message}`);
		},
	});

	const handleSubmit = (data: ProductFormData) => {
		updateProduct({
			id: Number(productId),
			name: data.name,
			price: data.price,
			image: data.image,
			brand: data.brand,
			category: data.category || undefined,
			description: data.description || undefined,
			extraImages: data.extraImages.length > 0 ? data.extraImages : undefined,
		});
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!product) {
		return (
			<div className="min-h-screen bg-background">
				<div className="container mx-auto py-8 px-4">
					<div className="text-center">
						<h1 className="text-2xl font-bold mb-4">Product not found</h1>
						<Button asChild>
							<Link to="/admin/products">Back to Products</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const initialData: ProductFormData = {
		name: product.name,
		price: product.price,
		image: product.image,
		brand: product.brand,
		category: product.category || "",
		description: product.description || "",
		extraImages: product.extraImages?.map((img) => img.image) || [],
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
					<h1 className="text-3xl font-bold">Edit Product</h1>
				</div>

				<ProductForm
					initialData={initialData}
					onSubmit={handleSubmit}
					isLoading={isPending}
					submitLabel="Update Product"
				/>
			</div>
		</div>
	);
}
