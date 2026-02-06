import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const todos = sqliteTable("Todo", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	title: text("title").notNull(),
	createdAt: integer("createdAt", { mode: "timestamp" }).default(
		new Date()
	),
});

export const products = sqliteTable("Product", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	price: text("price").notNull(),
	image: text("image").notNull(),
	brand: text("brand").notNull(),
	category: text("category"),
	gender: text("gender"), // "Hombre", "Mujer", or null for unisex
	description: text("description"),
	createdAt: integer("createdAt", { mode: "timestamp" }).default(
		new Date()
	),
});

export const extraImages = sqliteTable("extraImages", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	image: text("image").notNull(),
	productId: integer("productId")
		.notNull()
		.references(() => products.id),
});

// Relations
export const productsRelations = relations(products, ({ many }) => ({
	extraImages: many(extraImages),
}));

export const extraImagesRelations = relations(extraImages, ({ one }) => ({
	product: one(products, {
		fields: [extraImages.productId],
		references: [products.id],
	}),
}));

// Types
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ExtraImage = typeof extraImages.$inferSelect;
export type NewExtraImage = typeof extraImages.$inferInsert;
