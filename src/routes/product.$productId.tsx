import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { luxuryBrands, sneakerBrands } from "@/data/brands";
import { useTRPC } from "@/integrations/trpc/react";
import { getImageUrl } from "@/lib/utils";

export const Route = createFileRoute("/product/$productId")({
	component: ProductDetailPage,
	loader: async ({ context, params }) => {
		const productId = parseInt(params.productId, 10);
		await context.queryClient.prefetchQuery(
			context.trpc.products.byId.queryOptions({ id: productId }),
		);
	},
});

function ProductDetailPage() {
	const { productId } = Route.useParams();
	const trpc = useTRPC();
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isHeaderVisible, setIsHeaderVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);

	const { data: product, isLoading } = useQuery(
		trpc.products.byId.queryOptions({ id: parseInt(productId, 10) }),
	);

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			if (currentScrollY < lastScrollY || currentScrollY < 100) {
				setIsHeaderVisible(true);
			} else if (currentScrollY > lastScrollY && currentScrollY > 100) {
				setIsHeaderVisible(false);
			}
			setLastScrollY(currentScrollY);
		};
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [lastScrollY]);

	if (isLoading) {
		return (
			<div className="min-h-screen relative">
				<div className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0" style={{ backgroundImage: "url(/aura-hype-web-background.png)" }} />
				<div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black z-0" />
				<div className="relative z-10 min-h-screen flex items-center justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400" />
				</div>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="min-h-screen relative">
				<div className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0" style={{ backgroundImage: "url(/aura-hype-web-background.png)" }} />
				<div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black z-0" />
				<div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-white">
					<h1 className="text-2xl font-bold mb-4">Product not found</h1>
					<Link to="/" className="text-blue-400 hover:underline">
						← Back to home
					</Link>
				</div>
			</div>
		);
	}

	// Combine main image with extra images
	const allImages = [
		product.image,
		...product.extraImages.map((ei) => ei.image),
	];

	const nextImage = () => {
		setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
	};

	const prevImage = () => {
		setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
	};

	return (
		<div className="min-h-screen text-white relative">
			{/* Slide-out Menu */}
			{isMenuOpen && (
				<div className="fixed inset-0 bg-black/50 z-[9999]" onClick={() => setIsMenuOpen(false)}>
					<div className="absolute left-0 top-0 h-full w-80 bg-white text-black overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
						<button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full" type="button">
							<X className="w-6 h-6" />
						</button>
						<div className="p-6 pt-16">
							<div className="mb-8">
								<h2 className="text-xl font-bold mb-4 uppercase tracking-wide">Sneakers</h2>
								<ul className="space-y-3">
									{sneakerBrands.map((brand) => (
										<li key={brand.path}>
											<Link to={brand.path} className="block hover:text-blue-600 transition-colors uppercase text-sm" onClick={() => setIsMenuOpen(false)}>{brand.name}</Link>
										</li>
									))}
								</ul>
							</div>
							<div className="mb-8">
								<h2 className="text-xl font-bold mb-4 uppercase tracking-wide">Luxury Brands</h2>
								<ul className="space-y-3">
									{luxuryBrands.map((brand) => (
										<li key={brand.path}>
											<Link to={brand.path} className="block hover:text-blue-600 transition-colors uppercase text-sm" onClick={() => setIsMenuOpen(false)}>{brand.name}</Link>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Background */}
			<div className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0" style={{ backgroundImage: "url(/aura-hype-web-background.png)" }} />
			<div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black z-0" />

			{/* Header */}
			<header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-start gap-6 px-6 py-6 bg-black/30 backdrop-blur-sm transition-transform duration-300 ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"}`}>
				<button onClick={() => setIsMenuOpen(true)} className="hover:text-blue-400 transition-colors" type="button"><Menu className="w-6 h-6" /></button>
				<Link to="/" className="hover:text-blue-400 transition-colors"><ChevronLeft className="w-6 h-6" /></Link>
				<button className="hover:text-blue-400 transition-colors" type="button"><Search className="w-6 h-6" /></button>
			</header>

			{/* Product Detail */}
			<main className="relative z-10 max-w-7xl mx-auto px-4 py-8 pt-28">
				<div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-white/20">
					<div className="grid md:grid-cols-2 gap-8 p-6">
						{/* Image Gallery */}
						<div className="space-y-4">
							{/* Main Image */}
							<div className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden">
								<img
									src={getImageUrl(allImages[currentImageIndex])}
									alt={product.name}
									className="w-full h-full object-cover"
								/>

								{/* Navigation arrows (only show if multiple images) */}
								{allImages.length > 1 && (
									<>
										<button
											onClick={prevImage}
											className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
											type="button"
										>
											<ChevronLeft className="w-6 h-6" />
										</button>
										<button
											onClick={nextImage}
											className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
											type="button"
										>
											<ChevronRight className="w-6 h-6" />
										</button>
									</>
								)}
							</div>

							{/* Thumbnail Strip */}
							{allImages.length > 1 && (
								<div className="flex gap-2 overflow-x-auto pb-2">
									{allImages.map((image, index) => (
										<button
											key={index}
											onClick={() => setCurrentImageIndex(index)}
											className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
												index === currentImageIndex
													? "border-blue-600 ring-2 ring-blue-600/50"
													: "border-transparent hover:border-gray-300"
											}`}
											type="button"
										>
											<img
												src={getImageUrl(image)}
												alt={`${product.name} - Image ${index + 1}`}
												className="w-full h-full object-cover"
											/>
										</button>
									))}
								</div>
							)}
						</div>

						{/* Product Info */}
						<div className="space-y-6">
							<div>
								<p className="text-sm text-gray-400 uppercase tracking-wide mb-1">
									{product.brand}
								</p>
								<h1 className="text-3xl font-bold text-white">
									{product.name}
								</h1>
							</div>

							<p className="text-4xl font-bold text-blue-400">{product.price}</p>

							{product.category && (
								<div>
									<span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm">
										{product.category}
									</span>
								</div>
							)}

							{product.description && (
								<div>
									<h2 className="text-lg font-semibold text-white mb-2">
										Description
									</h2>
									<p className="text-gray-300">{product.description}</p>
								</div>
							)}

							{/* Image count indicator */}
							{allImages.length > 1 && (
								<p className="text-sm text-gray-400">
									{allImages.length} images available
								</p>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
