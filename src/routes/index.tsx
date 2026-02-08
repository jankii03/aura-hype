import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Menu, Search, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { luxuryBrands, sneakerBrands, estiloUrbanoBrands, gorrasBrands, accesoriosBrands } from "../data/brands";
import { useSearch } from "@/components/SearchModal";
import { useTRPC } from "@/integrations/trpc/react";
import { getImageUrl } from "@/lib/utils";
import { isCloudflare } from "@/integrations/tanstack-query/root-provider";

interface Product {
	id: number;
	name: string;
	price: string;
	image: string;
	brand: string;
	category: string | null;
	gender: string | null;
	description: string | null;
	createdAt: Date | null;
	extraImages: { id: number; image: string; productId: number }[];
}

export const Route = createFileRoute("/")({
	component: App,
	loader: async ({ context }) => {
		// Skip SSR prefetching on Cloudflare - client will fetch after hydration
		if (isCloudflare()) {
			return;
		}
		await context.queryClient.prefetchQuery(
			context.trpc.products.list.queryOptions(),
		);
	},
});

function App() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { openSearch } = useSearch();
	const carouselRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
	const trpc = useTRPC();

	const productsQuery = useQuery(trpc.products.list.queryOptions());
	const products = (productsQuery.data ?? []) as Product[];

	// Create brand name to path mapping
	const allBrandsList = [...sneakerBrands, ...luxuryBrands, ...estiloUrbanoBrands, ...gorrasBrands, ...accesoriosBrands];
	const brandPathMap = useMemo(() => {
		const map = new Map<string, string>();
		for (const brand of allBrandsList) {
			map.set(brand.name.toLowerCase(), brand.path);
		}
		return map;
	}, []);

	// Group products by brand (limited to 5 per brand for homepage)
	const brands = useMemo(() => {
		if (products.length === 0) return [];

		const brandMap = new Map<string, Product[]>();

		for (const product of products) {
			const existing = brandMap.get(product.brand);
			if (existing) {
				existing.push(product);
			} else {
				brandMap.set(product.brand, [product]);
			}
		}

		return Array.from(brandMap.entries()).map(([name, brandProducts]) => ({
			name: name.toUpperCase(),
			path: brandPathMap.get(name.toLowerCase()) || `/brands/${name.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "")}`,
			totalCount: brandProducts.length,
			products: brandProducts.slice(0, 5).map((p) => ({
				id: p.id,
				name: p.name,
				price: p.price,
				image: getImageUrl(p.image),
			})),
		}));
	}, [products, brandPathMap]);

	const scrollContainer = (index: number, direction: "left" | "right") => {
		const container = carouselRefs.current[index];
		if (container) {
			const scrollAmount = direction === "left" ? -400 : 400;
			container.scrollBy({ left: scrollAmount, behavior: "smooth" });
		}
	};

	return (
		<div className="min-h-screen text-white relative">
			{/* Background */}
			<div
				className="fixed inset-0 bg-cover bg-center bg-no-repeat"
				style={{
					backgroundImage: "url(/aura-hype-web-background.png)",
					zIndex: -2,
				}}
			/>

			{/* Side Menu Overlay */}
			{isMenuOpen && (
				<div
					className="fixed inset-0 bg-black/50 animate-fadeIn"
					style={{ zIndex: 9999 }}
					onClick={() => setIsMenuOpen(false)}
				>
					<div
						className="absolute left-0 top-0 h-full w-80 bg-white text-black overflow-y-auto shadow-2xl animate-slideInLeft"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={() => setIsMenuOpen(false)}
							className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
							type="button"
						>
							<X className="w-6 h-6" />
						</button>

						<div className="p-6 pt-16">
							<div className="mb-8">
								<h2 className="text-xl font-bold mb-4 uppercase tracking-wide">
									Zapatos
								</h2>
								<ul className="space-y-3">
									{sneakerBrands.map((brand) => (
										<li key={brand.path}>
											<Link
												to={brand.path}
												className="block hover:text-blue-600 uppercase text-sm"
												onClick={() => setIsMenuOpen(false)}
											>
												{brand.name}
											</Link>
										</li>
									))}
								</ul>
							</div>

							<div className="mb-8">
								<h2 className="text-xl font-bold mb-4 uppercase tracking-wide">
									Marcas de Lujo
								</h2>
								<ul className="space-y-3">
									{luxuryBrands.map((brand) => (
										<li key={brand.path}>
											<Link
												to={brand.path}
												className="block hover:text-blue-600 uppercase text-sm"
												onClick={() => setIsMenuOpen(false)}
											>
												{brand.name}
											</Link>
										</li>
									))}
								</ul>
							</div>

							<div className="mb-8">
								<h2 className="text-xl font-bold mb-4 uppercase tracking-wide">
									Estilo Urbano
								</h2>
								<ul className="space-y-3">
									{estiloUrbanoBrands.map((brand) => (
										<li key={brand.path}>
											<Link
												to={brand.path}
												className="block hover:text-blue-600 uppercase text-sm"
												onClick={() => setIsMenuOpen(false)}
											>
												{brand.name}
											</Link>
										</li>
									))}
								</ul>
							</div>

							<div className="mb-8">
								<h2 className="text-xl font-bold mb-4 uppercase tracking-wide">
									Gorras
								</h2>
								<ul className="space-y-3">
									{gorrasBrands.map((brand) => (
										<li key={brand.path}>
											<Link
												to={brand.path}
												className="block hover:text-blue-600 uppercase text-sm"
												onClick={() => setIsMenuOpen(false)}
											>
												{brand.name}
											</Link>
										</li>
									))}
								</ul>
							</div>

							<div className="mb-8">
								<h2 className="text-xl font-bold mb-4 uppercase tracking-wide">
									Accesorios
								</h2>
								<ul className="space-y-3">
									{accesoriosBrands.map((brand) => (
										<li key={brand.path}>
											<Link
												to={brand.path}
												className="block hover:text-blue-600 uppercase text-sm"
												onClick={() => setIsMenuOpen(false)}
											>
												{brand.name}
											</Link>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Main Content */}
			<div className="relative">
				{/* Header */}
				<header className="flex items-center justify-start gap-6 px-6 py-6">
					<button
						onClick={() => setIsMenuOpen(true)}
						className="p-3 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer"
						type="button"
					>
						<Menu className="w-6 h-6" />
					</button>
					<button
						onClick={openSearch}
						className="p-3 hover:text-blue-400"
						type="button"
					>
						<Search className="w-6 h-6" />
					</button>
				</header>

				{/* Logo */}
				<main className="flex flex-col items-center justify-center min-h-[60vh] px-6">
					<img
						src="/aura-hype-official-logo.png"
						alt="Aura Hype"
						className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
					/>
				</main>

				{/* Products Section */}
				<section className="bg-gradient-to-b from-white/95 to-gray-100/95 py-12">
					<div className="max-w-7xl mx-auto px-6">
						{brands.map((brand, brandIndex) => (
							<div key={brand.name} className={brandIndex > 0 ? "mt-16" : ""}>
								<div className="flex items-center justify-between mb-8">
									<h2 className="text-3xl font-bold text-black uppercase">
										{brand.name}
									</h2>
									{brand.totalCount > 5 && (
										<Link
											to={brand.path}
											className="text-blue-600 hover:text-blue-800 font-semibold text-sm uppercase tracking-wide"
										>
											View All ({brand.totalCount})
										</Link>
									)}
								</div>

								<div className="relative">
									{/* Left Arrow */}
									<button
										onClick={() => scrollContainer(brandIndex, "left")}
										className="absolute left-0 top-1/2 -translate-y-1/2 bg-black hover:bg-blue-600 text-white rounded-full p-3 shadow-xl"
										style={{ zIndex: 20 }}
										type="button"
									>
										<ChevronLeft className="w-6 h-6" />
									</button>

									{/* Products */}
									<div
										ref={(el) => {
											carouselRefs.current[brandIndex] = el;
										}}
										className="flex gap-6 overflow-x-auto pb-4 px-14 scroll-smooth"
										style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
									>
										{brand.products.map((product) => (
											<Link
												key={product.id}
												to="/product/$productId"
												params={{ productId: String(product.id) }}
												className="flex-none w-72 bg-white rounded-lg shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer"
											>
												<div className="aspect-square bg-gray-200 overflow-hidden">
													<img
														src={product.image}
														alt={product.name}
														className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
													/>
												</div>
												<div className="p-4 text-center">
													<h3 className="text-sm font-bold text-black uppercase mb-2 line-clamp-2">
														{product.name}
													</h3>
													<p className="text-lg font-bold text-blue-600">
														{product.price}
													</p>
												</div>
											</Link>
										))}
									</div>

									{/* Right Arrow */}
									<button
										onClick={() => scrollContainer(brandIndex, "right")}
										className="absolute right-0 top-1/2 -translate-y-1/2 bg-black hover:bg-blue-600 text-white rounded-full p-3 shadow-xl"
										style={{ zIndex: 20 }}
										type="button"
									>
										<ChevronRight className="w-6 h-6" />
									</button>
								</div>
							</div>
						))}
					</div>
				</section>
			</div>
		</div>
	);
}
