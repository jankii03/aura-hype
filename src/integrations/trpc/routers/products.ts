import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { eq, like, desc } from "drizzle-orm";
import { getDb, schema } from "@/db.server";
import { publicProcedure } from "../init";

export const productsRouter = {
	list: publicProcedure
		.input(
			z
				.object({
					brand: z.string().optional(),
					search: z.string().optional(),
				})
				.optional(),
		)
		.query(async ({ input }) => {
			const db = getDb();

			// Build query with filters
			let query = db.query.products.findMany({
				with: {
					extraImages: true,
				},
				orderBy: [desc(schema.products.createdAt)],
				where: input?.brand
					? eq(schema.products.brand, input.brand)
					: input?.search
						? like(schema.products.name, `%${input.search}%`)
						: undefined,
			});

			return query;
		}),

	byId: publicProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input }) => {
			const db = getDb();

			const product = await db.query.products.findFirst({
				where: eq(schema.products.id, input.id),
				with: {
					extraImages: true,
				},
			});

			return product ?? null;
		}),

	create: publicProcedure
		.input(
			z.object({
				name: z.string().min(1),
				price: z.string().min(1),
				image: z.string().min(1),
				brand: z.string().min(1),
				category: z.string().optional(),
				description: z.string().optional(),
				extraImages: z.array(z.string()).optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const db = getDb();
			const { extraImages: extraImageUrls, ...productData } = input;

			// Insert product
			const result = await db
				.insert(schema.products)
				.values(productData)
				.returning();
			const product = result[0];

			// Insert extra images if provided
			if (extraImageUrls && extraImageUrls.length > 0) {
				await db.insert(schema.extraImages).values(
					extraImageUrls.map((image) => ({
						image,
						productId: product.id,
					})),
				);
			}

			// Return product with extra images
			return db.query.products.findFirst({
				where: eq(schema.products.id, product.id),
				with: { extraImages: true },
			});
		}),

	update: publicProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string().min(1),
				price: z.string().min(1),
				image: z.string().min(1),
				brand: z.string().min(1),
				category: z.string().optional(),
				description: z.string().optional(),
				extraImages: z.array(z.string()).optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const db = getDb();
			const { id, extraImages: extraImageUrls, ...productData } = input;

			// Update product
			await db
				.update(schema.products)
				.set(productData)
				.where(eq(schema.products.id, id));

			// Delete existing extra images and insert new ones
			await db
				.delete(schema.extraImages)
				.where(eq(schema.extraImages.productId, id));

			if (extraImageUrls && extraImageUrls.length > 0) {
				await db.insert(schema.extraImages).values(
					extraImageUrls.map((image) => ({
						image,
						productId: id,
					})),
				);
			}

			// Return updated product with extra images
			return db.query.products.findFirst({
				where: eq(schema.products.id, id),
				with: { extraImages: true },
			});
		}),

	delete: publicProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input }) => {
			const db = getDb();

			// Delete extra images first (foreign key constraint)
			await db
				.delete(schema.extraImages)
				.where(eq(schema.extraImages.productId, input.id));

			// Delete product
			const result = await db
				.delete(schema.products)
				.where(eq(schema.products.id, input.id))
				.returning();

			return result[0];
		}),
} satisfies TRPCRouterRecord;
