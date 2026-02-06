import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { luxuryBrands, sneakerBrands } from "@/data/brands";
import { useTRPC } from "@/integrations/trpc/react";
import { isCloudflare } from "@/integrations/tanstack-query/root-provider";
import { getImageUrl } from "@/lib/utils";

interface Product {
	id: number;
	name: string;
	price: string;
	image: string;
	brand: string;
}

export const Route = createFileRoute("/brands/amiri/")({
	component: AmiriPage,
	loader: async ({ context }) => {
		// Skip SSR prefetching on Cloudflare - client will fetch after hydration
		if (isCloudflare()) {
			return;
		}
		await context.queryClient.prefetchQuery(
			context.trpc.products.list.queryOptions({ brand: "Amiri" }),
		);
	},
});

function AmiriPage() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isHeaderVisible, setIsHeaderVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);
	const [genderFilter, setGenderFilter] = useState<string | null>(null);
	const trpc = useTRPC();

	const { data } = useQuery(
		trpc.products.list.queryOptions({ brand: "Amiri", ...(genderFilter && { gender: genderFilter }) })
	);
	const products = (data ?? []) as Product[];

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

	return (
		<div className="min-h-screen text-white relative">
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

			<div className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0" style={{ backgroundImage: "url(/aura-hype-web-background.png)" }} />
			<div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black z-0" />

			<header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-start gap-6 px-6 py-6 bg-black/30 backdrop-blur-sm transition-transform duration-300 ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"}`}>
				<button onClick={() => setIsMenuOpen(true)} className="hover:text-blue-400 transition-colors" type="button"><Menu className="w-6 h-6" /></button>
				<Link to="/" className="hover:text-blue-400 transition-colors"><ChevronLeft className="w-6 h-6" /></Link>
				<button className="hover:text-blue-400 transition-colors" type="button"><Search className="w-6 h-6" /></button>
			</header>

			<main className="relative z-10 container mx-auto px-6 py-12 pt-28">
				<h1 className="text-4xl md:text-6xl font-bold mb-8 uppercase tracking-wider">Amiri</h1>

				{/* Gender Filter */}
				<div className="flex gap-4 mb-8">
					<button
						onClick={() => setGenderFilter(null)}
						className={`px-4 py-2 rounded-full font-semibold uppercase text-sm tracking-wide transition-colors ${
							genderFilter === null
								? "bg-white text-black"
								: "bg-white/20 text-white hover:bg-white/30"
						}`}
						type="button"
					>
						Todos
					</button>
					<button
						onClick={() => setGenderFilter("Hombre")}
						className={`px-4 py-2 rounded-full font-semibold uppercase text-sm tracking-wide transition-colors ${
							genderFilter === "Hombre"
								? "bg-white text-black"
								: "bg-white/20 text-white hover:bg-white/30"
						}`}
						type="button"
					>
						Hombre
					</button>
					<button
						onClick={() => setGenderFilter("Mujer")}
						className={`px-4 py-2 rounded-full font-semibold uppercase text-sm tracking-wide transition-colors ${
							genderFilter === "Mujer"
								? "bg-white text-black"
								: "bg-white/20 text-white hover:bg-white/30"
						}`}
						type="button"
					>
						Mujer
					</button>
				</div>

				{products.length === 0 ? (
					<p className="text-gray-400 text-center py-12">No products available for this brand yet.</p>
				) : (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{products.map((product) => (
							<Link key={product.id} to="/product/$productId" params={{ productId: String(product.id) }} className="group cursor-pointer">
								<div className="aspect-square bg-gray-800 rounded-lg overflow-hidden mb-3">
									<img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
								</div>
								<h3 className="text-sm font-medium mb-1">{product.name}</h3>
								<p className="text-blue-400 font-bold">{product.price}</p>
							</Link>
						))}
					</div>
				)}
			</main>
		</div>
	);
}
