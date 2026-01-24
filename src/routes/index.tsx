import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Menu, Search, X } from "lucide-react";
import { useRef, useState } from "react";
import { luxuryBrands, sneakerBrands } from "../data/brands";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const carouselRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

	const getImageUrl = (r2Key: string) => {
		const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
		if (r2PublicUrl) {
			return `${r2PublicUrl}/${r2Key}`;
		}
		return `/api/r2-image?key=${encodeURIComponent(r2Key)}`;
	};

	const brands = [
		{
			name: "LOUIS VUITTON",
			products: [
				{
					id: 1,
					name: "Louis Vuitton Trainer Sneaker Yellow Monogram Denim White",
					price: "$150.00",
					image: getImageUrl("00406430-6192-456e-9f34-724d5426e303.jpg"),
				},
				{
					id: 2,
					name: "Louis Vuitton Trainer Sneaker Light Blue White",
					price: "$160.00",
					image: getImageUrl("00c8c7b9-22b9-47a4-8bfc-69526d22d114(1).jpg"),
				},
				{
					id: 3,
					name: "Louis Vuitton Trainer Sneaker Monogram Denim White Blue",
					price: "$155.00",
					image: getImageUrl("00e62858-1dcf-4388-b2a5-95619ce6b759.jpg"),
				},
				{
					id: 7,
					name: "Louis Vuitton Trainer Sneaker Green White",
					price: "$165.00",
					image: getImageUrl("0354375f-41b7-41ba-935f-c93d851c7593.jpg"),
				},
				{
					id: 8,
					name: "Louis Vuitton Trainer Sneaker Blue Damier 3D Denim Blue",
					price: "$170.00",
					image: getImageUrl("0c9ecf18-d1db-475a-a148-53f911136ac8.jpg"),
				},
				{
					id: 9,
					name: "Louis Vuitton Trainer Sneaker Navy Blue Light Blue White",
					price: "$158.00",
					image: getImageUrl("0fc55ba7-14ee-49f9-b49f-248f23bfcdd1(1).jpg"),
				},
				{
					id: 10,
					name: "Louis Vuitton Trainer Sneaker White Comic Motifs",
					price: "$175.00",
					image: getImageUrl("16913a7a-e712-47d0-b791-6bcd1d7f7f39.jpg"),
				},
			],
		},
		{
			name: "ASICS",
			products: [
				{
					id: 4,
					name: "ASICS GEL-KAYANO 14",
					price: "$140.00",
					image: getImageUrl("1asics-demo-shoe.jfif"),
				},
				{
					id: 5,
					name: "ASICS GEL-NYC",
					price: "$130.00",
					image: getImageUrl("1asics-demo-shoe.jfif"),
				},
				{
					id: 6,
					name: "ASICS GEL-1130",
					price: "$120.00",
					image: getImageUrl("1asics-demo-shoe.jfif"),
				},
				{
					id: 11,
					name: "ASICS GEL-QUANTUM 360",
					price: "$150.00",
					image: getImageUrl("1asics-demo-shoe.jfif"),
				},
				{
					id: 12,
					name: "ASICS GEL-NIMBUS 25",
					price: "$160.00",
					image: getImageUrl("1asics-demo-shoe.jfif"),
				},
				{
					id: 13,
					name: "ASICS GEL-CUMULUS 25",
					price: "$135.00",
					image: getImageUrl("1asics-demo-shoe.jfif"),
				},
				{
					id: 14,
					name: "ASICS GT-2000 12",
					price: "$145.00",
					image: getImageUrl("1asics-demo-shoe.jfif"),
				},
			],
		},
	];

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
									Sneakers
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
									Luxury Brands
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
					<button className="p-3 hover:text-blue-400" type="button">
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
								<h2 className="text-3xl font-bold text-black mb-8 uppercase">
									{brand.name}
								</h2>

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
											<div
												key={product.id}
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
											</div>
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
