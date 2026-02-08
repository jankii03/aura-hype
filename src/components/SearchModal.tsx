import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Loader2, Search, X } from "lucide-react";
import { createContext, useContext, useState, type ReactNode } from "react";
import { productTags } from "@/data/tags";
import { useTRPC } from "@/integrations/trpc/react";
import { getImageUrl, cn } from "@/lib/utils";

interface Product {
	id: number;
	name: string;
	price: string;
	image: string;
	brand: string;
}

interface SearchContextType {
	isSearchOpen: boolean;
	openSearch: () => void;
	closeSearch: () => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

export function useSearch() {
	const context = useContext(SearchContext);
	if (!context) {
		throw new Error("useSearch must be used within a SearchProvider");
	}
	return context;
}

export function SearchProvider({ children }: { children: ReactNode }) {
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	const openSearch = () => setIsSearchOpen(true);
	const closeSearch = () => setIsSearchOpen(false);

	return (
		<SearchContext.Provider value={{ isSearchOpen, openSearch, closeSearch }}>
			{children}
			<SearchModal />
		</SearchContext.Provider>
	);
}

function SearchModal() {
	const { isSearchOpen, closeSearch } = useSearch();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTag, setSelectedTag] = useState<string | null>(null);
	const trpc = useTRPC();

	// Reset state when modal closes
	const handleClose = () => {
		closeSearch();
		setSearchQuery("");
		setSelectedTag(null);
	};

	// Search query - only runs when search is open and has query or tag
	const searchEnabled = isSearchOpen && (searchQuery.length > 0 || selectedTag !== null);
	const searchResults = useQuery({
		...trpc.products.list.queryOptions({
			...(searchQuery && { search: searchQuery }),
			...(selectedTag && { tag: selectedTag }),
		}),
		enabled: searchEnabled,
	});

	if (!isSearchOpen) return null;

	return (
		<div
			className="fixed inset-0 bg-black/80 animate-fadeIn"
			style={{ zIndex: 9999 }}
			onClick={handleClose}
		>
			<div
				className="absolute inset-x-0 top-0 bg-white text-black shadow-2xl animate-slideInDown max-h-[90vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="max-w-4xl mx-auto p-6">
					{/* Search Header */}
					<div className="flex items-center gap-4 mb-6">
						<div className="flex-1 relative">
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
							<input
								type="text"
								placeholder="Buscar productos..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								autoFocus
							/>
						</div>
						<button
							onClick={handleClose}
							className="p-2 hover:bg-gray-100 rounded-full"
							type="button"
						>
							<X className="w-6 h-6" />
						</button>
					</div>

					{/* Tag Filters */}
					<div className="mb-6">
						<p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
							Filtrar por categoria
						</p>
						<div className="flex flex-wrap gap-2">
							{productTags.map((tag) => (
								<button
									key={tag.value}
									type="button"
									onClick={() => setSelectedTag(selectedTag === tag.value ? null : tag.value)}
									className={cn(
										"px-4 py-2 rounded-full text-sm font-medium transition-colors border",
										selectedTag === tag.value
											? "bg-black text-white border-black"
											: "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
									)}
								>
									{tag.label}
								</button>
							))}
						</div>
					</div>

					{/* Search Results */}
					{searchEnabled && (
						<div>
							<p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
								{searchResults.isLoading
									? "Buscando..."
									: `${(searchResults.data as Product[] | undefined)?.length || 0} resultados`}
							</p>

							{searchResults.isLoading ? (
								<div className="flex justify-center py-12">
									<Loader2 className="w-8 h-8 animate-spin text-gray-400" />
								</div>
							) : (searchResults.data as Product[] | undefined)?.length === 0 ? (
								<div className="text-center py-12 text-gray-500">
									No se encontraron productos
								</div>
							) : (
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
									{(searchResults.data as Product[] | undefined)?.map((product) => (
										<Link
											key={product.id}
											to="/product/$productId"
											params={{ productId: String(product.id) }}
											onClick={handleClose}
											className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
										>
											<div className="aspect-square bg-gray-200 overflow-hidden">
												<img
													src={getImageUrl(product.image)}
													alt={product.name}
													className="w-full h-full object-cover"
												/>
											</div>
											<div className="p-3">
												<h3 className="text-sm font-semibold text-black line-clamp-2 mb-1">
													{product.name}
												</h3>
												<p className="text-sm text-gray-500 mb-1">{product.brand}</p>
												<p className="text-blue-600 font-bold">{product.price}</p>
											</div>
										</Link>
									))}
								</div>
							)}
						</div>
					)}

					{/* Initial State - No search yet */}
					{!searchEnabled && (
						<div className="text-center py-12 text-gray-500">
							Escribe para buscar o selecciona una categoria
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
