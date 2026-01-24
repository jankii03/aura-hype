import { Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { brandNames } from "@/data/all-brands";
import { getImageUrl } from "@/lib/utils";

export interface ProductFormData {
	name: string;
	price: string;
	image: string;
	brand: string;
	category: string;
	description: string;
	extraImages: string[];
}

interface ProductFormProps {
	initialData?: ProductFormData;
	onSubmit: (data: ProductFormData) => void;
	isLoading?: boolean;
	submitLabel?: string;
}

const categories = ["Sneakers", "Boots", "Sandals", "Loafers", "Athletic"];

export function ProductForm({
	initialData,
	onSubmit,
	isLoading = false,
	submitLabel = "Save Product",
}: ProductFormProps) {
	const [formData, setFormData] = useState<ProductFormData>(
		initialData || {
			name: "",
			price: "",
			image: "",
			brand: "",
			category: "",
			description: "",
			extraImages: [],
		},
	);

	const [imageUploading, setImageUploading] = useState(false);
	const [extraImageUploading, setExtraImageUploading] = useState(false);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const uploadImage = async (file: File): Promise<string | null> => {
		const form = new FormData();
		form.append("file", file);

		try {
			const response = await fetch("/api/r2-upload", {
				method: "POST",
				body: form,
			});

			if (!response.ok) {
				const error = await response.text();
				alert(`Upload failed: ${error}`);
				return null;
			}

			const { key } = await response.json();
			return key;
		} catch (error) {
			console.error("Upload error:", error);
			alert("Failed to upload image");
			return null;
		}
	};

	const handleMainImageUpload = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setImageUploading(true);
		const key = await uploadImage(file);
		if (key) {
			setFormData((prev) => ({ ...prev, image: key }));
		}
		setImageUploading(false);
	};

	const handleExtraImageUpload = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setExtraImageUploading(true);
		const key = await uploadImage(file);
		if (key) {
			setFormData((prev) => ({
				...prev,
				extraImages: [...prev.extraImages, key],
			}));
		}
		setExtraImageUploading(false);
	};

	const removeExtraImage = (index: number) => {
		setFormData((prev) => ({
			...prev,
			extraImages: prev.extraImages.filter((_, i) => i !== index),
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	return (
		<form onSubmit={handleSubmit}>
			<Card>
				<CardHeader>
					<CardTitle>Product Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="name">Name *</Label>
							<Input
								id="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								required
								placeholder="Product name"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="price">Price *</Label>
							<Input
								id="price"
								name="price"
								value={formData.price}
								onChange={handleChange}
								required
								placeholder="$0.00"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="brand">Brand *</Label>
							<Select
								value={formData.brand}
								onValueChange={(value) => handleSelectChange("brand", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a brand" />
								</SelectTrigger>
								<SelectContent>
									{brandNames.map((brand) => (
										<SelectItem key={brand} value={brand}>
											{brand}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="category">Category</Label>
							<Select
								value={formData.category}
								onValueChange={(value) => handleSelectChange("category", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a category" />
								</SelectTrigger>
								<SelectContent>
									{categories.map((category) => (
										<SelectItem key={category} value={category}>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							placeholder="Product description..."
							rows={4}
						/>
					</div>

					<div className="space-y-2">
						<Label>Main Image *</Label>
						<div className="flex items-center gap-4">
							{formData.image && (
								<img
									src={getImageUrl(formData.image)}
									alt="Main product"
									className="h-24 w-24 rounded-md object-cover border"
								/>
							)}
							<label className="cursor-pointer">
								<div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted">
									{imageUploading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Upload className="h-4 w-4" />
									)}
									<span>{formData.image ? "Change" : "Upload"} Image</span>
								</div>
								<input
									type="file"
									accept="image/jpeg,image/png,image/webp,image/gif"
									onChange={handleMainImageUpload}
									className="hidden"
									disabled={imageUploading}
								/>
							</label>
						</div>
					</div>

					<div className="space-y-2">
						<Label>Extra Images</Label>
						<div className="flex flex-wrap gap-4">
							{formData.extraImages.map((key, index) => (
								<div key={index} className="relative">
									<img
										src={getImageUrl(key)}
										alt={`Extra ${index + 1}`}
										className="h-20 w-20 rounded-md object-cover border"
									/>
									<button
										type="button"
										onClick={() => removeExtraImage(index)}
										className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
									>
										<X className="h-3 w-3" />
									</button>
								</div>
							))}
							<label className="cursor-pointer">
								<div className="flex items-center justify-center h-20 w-20 border-2 border-dashed rounded-md hover:bg-muted">
									{extraImageUploading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Upload className="h-4 w-4" />
									)}
								</div>
								<input
									type="file"
									accept="image/jpeg,image/png,image/webp,image/gif"
									onChange={handleExtraImageUpload}
									className="hidden"
									disabled={extraImageUploading}
								/>
							</label>
						</div>
					</div>

					<div className="flex justify-end gap-4">
						<Button type="submit" disabled={isLoading || !formData.image}>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{submitLabel}
						</Button>
					</div>
				</CardContent>
			</Card>
		</form>
	);
}
