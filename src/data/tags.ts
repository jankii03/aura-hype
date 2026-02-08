// Product tags for categorization and search
export const productTags = [
	{ value: "zapato", label: "Zapato" },
	{ value: "camisa", label: "Camisa" },
	{ value: "media", label: "Media" },
	{ value: "gorra", label: "Gorra" },
	{ value: "bolsa", label: "Bolsa" },
	{ value: "accesorio", label: "Accesorio" },
	{ value: "pantalon", label: "Pantalon" },
	{ value: "sudadera", label: "Sudadera" },
	{ value: "camiseta", label: "Camiseta" },
	{ value: "chaqueta", label: "Chaqueta" },
	{ value: "correa", label: "Correa" },
	{ value: "pantalla", label: "Pantalla" },
] as const;

// Type for tag values
export type ProductTag = (typeof productTags)[number]["value"];

// Simple array of tag values for validation
export const tagValues = productTags.map((t) => t.value);
