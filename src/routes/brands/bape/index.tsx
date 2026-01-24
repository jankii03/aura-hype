import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Menu, Search, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/brands/bape/")({
	component: BapePage,
});

function BapePage() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const getImageUrl = (key: string) => {
		const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
		if (publicUrl) {
			return `${publicUrl}/${key}`;
		}
		return `/api/r2-image?key=${encodeURIComponent(key)}`;
	};

	const bapeProducts = [
		{
			id: 1,
			name: "BAPE Sta",
			price: "$275",
			image: "bape-sta.jpg",
		},
		{
			id: 2,
			name: "BAPE Sk8 Sta",
			price: "$295",
			image: "bape-sk8-sta.jpg",
		},
	];

	return (
		<div className="min-h-screen bg-black text-white relative overflow-hidden">
			{/* Side Menu */}
			<div
				className={`fixed inset-0 z-50 transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
				onClick={() => setIsMenuOpen(false)}
			>
				<div className="absolute inset-0 bg-black/50"></div>
				<div
					className={`absolute left-0 top-0 h-full w-80 bg-white text-black transform transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} overflow-y-auto`}
					onClick={(e) => e.stopPropagation()}
				>
					<button
						onClick={() => setIsMenuOpen(false)}
						className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
					>
						<X className="w-6 h-6" />
					</button>
					<div className="p-6 pt-16">
						<div className="mb-8">
							<h2 className="text-xl font-bold mb-4 uppercase tracking-wide">
								Sneakers
							</h2>
							<ul className="space-y-3">
								<li>
									<Link
										to="/brands/asics"
										className="block hover:text-blue-600 transition-colors uppercase text-sm"
										onClick={() => setIsMenuOpen(false)}
									>
										Asics
									</Link>
								</li>
								<li>
									<Link
										to="/brands/jordan"
										className="block hover:text-blue-600 transition-colors uppercase text-sm"
										onClick={() => setIsMenuOpen(false)}
									>
										Jordan
									</Link>
								</li>
								<li>
									<Link
										to="/brands/new-balance"
										className="block hover:text-blue-600 transition-colors uppercase text-sm"
										onClick={() => setIsMenuOpen(false)}
									>
										New Balance
									</Link>
								</li>
								<li>
									<Link
										to="/brands/nike"
										className="block hover:text-blue-600 transition-colors uppercase text-sm"
										onClick={() => setIsMenuOpen(false)}
									>
										Nike
									</Link>
								</li>
							</ul>
						</div>
						<div className="mb-8">
							<h2 className="text-xl font-bold mb-4 uppercase tracking-wide">
								Luxury Brands
							</h2>
							<ul className="space-y-3">
								<li>
									<Link
										to="/brands/amiri"
										className="block hover:text-blue-600 transition-colors uppercase text-sm"
										onClick={() => setIsMenuOpen(false)}
									>
										Amiri
									</Link>
								</li>
								<li>
									<Link
										to="/brands/balenciaga"
										className="block hover:text-blue-600 transition-colors uppercase text-sm"
										onClick={() => setIsMenuOpen(false)}
									>
										Balenciaga
									</Link>
								</li>
								<li>
									<Link
										to="/brands/bape"
										className="block hover:text-blue-600 transition-colors uppercase text-sm"
										onClick={() => setIsMenuOpen(false)}
									>
										Bape
									</Link>
								</li>
								<li>
									<Link
										to="/brands/dior"
										className="block hover:text-blue-600 transition-colors uppercase text-sm"
										onClick={() => setIsMenuOpen(false)}
									>
										Dior
									</Link>
								</li>
								<li>
									<Link
										to="/brands/dolce-gabana"
										className="block hover:text-blue-600 transition-colors uppercase text-sm"
										onClick={() => setIsMenuOpen(false)}
									>
										Dolce & Gabbana
									</Link>
								</li>
								<li>
									<Link
										to="/brands/gucci"
										className="block hover:text-blue-600 transition-colors uppercase text-sm"
										onClick={() => setIsMenuOpen(false)}
									>
										Gucci
									</Link>
								</li>
								<li>
									<Link
										to="/brands/louis-vuitton"
										className="block hover:text-blue-600 transition-colors uppercase text-sm"
										onClick={() => setIsMenuOpen(false)}
									>
										Louis Vuitton
									</Link>
								</li>
								<li>
									<Link
										to="/brands/prada"
										className="block hover:text-blue-600 transition-colors uppercase text-sm"
										onClick={() => setIsMenuOpen(false)}
									>
										Prada
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			<div
				className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
				style={{ backgroundImage: "url(/aura-hype-web-background.png)" }}
			></div>

			<div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black z-0"></div>

			<header className="relative z-10 flex items-center justify-start gap-6 px-6 py-6">
				<button
					onClick={() => setIsMenuOpen(true)}
					className="hover:text-blue-400 transition-colors"
				>
					<Menu className="w-6 h-6" />
				</button>
				<a href="/" className="hover:text-blue-400 transition-colors">
					<ChevronLeft className="w-6 h-6" />
				</a>
				<button className="hover:text-blue-400 transition-colors">
					<Search className="w-6 h-6" />
				</button>
			</header>

			<main className="relative z-10 container mx-auto px-6 py-12">
				<h1 className="text-4xl md:text-6xl font-bold mb-8 uppercase tracking-wider">
					BAPE
				</h1>

				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{bapeProducts.map((product) => (
						<div key={product.id} className="group cursor-pointer">
							<div className="aspect-square bg-gray-800 rounded-lg overflow-hidden mb-3">
								<img
									src={getImageUrl(product.image)}
									alt={product.name}
									className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									onError={(e) => {
										e.currentTarget.src = "/placeholder-image.png";
									}}
								/>
							</div>
							<h3 className="text-sm font-medium mb-1">{product.name}</h3>
							<p className="text-blue-400 font-bold">{product.price}</p>
						</div>
					))}
				</div>
			</main>
		</div>
	);
}
