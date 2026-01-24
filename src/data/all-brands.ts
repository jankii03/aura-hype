import { luxuryBrands, sneakerBrands } from "./brands";

export const allBrands = [...sneakerBrands, ...luxuryBrands].sort((a, b) =>
	a.name.localeCompare(b.name),
);

export const brandNames = allBrands.map((b) => b.name);
