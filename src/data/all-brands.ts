import { luxuryBrands, sneakerBrands, estiloUrbanoBrands, gorrasBrands, accesoriosBrands } from "./brands";

export const allBrands = [
	...sneakerBrands,
	...luxuryBrands,
	...estiloUrbanoBrands,
	...gorrasBrands.filter(b => b.name !== "Jordan"), // Jordan already in sneakerBrands
	...accesoriosBrands,
].sort((a, b) => a.name.localeCompare(b.name));

export const brandNames = allBrands.map((b) => b.name);
