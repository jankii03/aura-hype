import { Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getImageUrl } from "@/lib/utils";

interface Product {
	id: number;
	name: string;
	price: string;
	image: string;
	brand: string;
	category: string | null;
}

interface ProductTableProps {
	products: Product[];
	onDelete: (id: number) => void;
	isDeleting?: number | null;
}

export function ProductTable({
	products,
	onDelete,
	isDeleting,
}: ProductTableProps) {
	if (products.length === 0) {
		return (
			<div className="text-center py-12 text-muted-foreground">
				No products found. Create your first product!
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-20">Image</TableHead>
					<TableHead>Name</TableHead>
					<TableHead>Brand</TableHead>
					<TableHead>Price</TableHead>
					<TableHead>Category</TableHead>
					<TableHead className="w-24">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{products.map((product) => (
					<TableRow key={product.id}>
						<TableCell>
							<img
								src={getImageUrl(product.image)}
								alt={product.name}
								className="h-12 w-12 rounded-md object-cover"
							/>
						</TableCell>
						<TableCell className="font-medium">{product.name}</TableCell>
						<TableCell>{product.brand}</TableCell>
						<TableCell>{product.price}</TableCell>
						<TableCell>{product.category || "-"}</TableCell>
						<TableCell>
							<div className="flex items-center gap-2">
								<Button variant="ghost" size="icon" asChild>
									<Link
										to="/admin/products/$productId"
										params={{ productId: String(product.id) }}
									>
										<Pencil className="h-4 w-4" />
									</Link>
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onDelete(product.id)}
									disabled={isDeleting === product.id}
								>
									<Trash2 className="h-4 w-4 text-destructive" />
								</Button>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
