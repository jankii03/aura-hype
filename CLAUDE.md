# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev                    # Start dev server on port 3000 (local SQLite)
pnpm build                  # Production build
pnpm preview                # Preview production build

# Testing & Quality
pnpm test                   # Run tests with Vitest
pnpm lint                   # Lint with Biome
pnpm format                 # Format with Biome
pnpm check                  # Combined lint + format check

# Database (Prisma + D1)
npx prisma generate         # Generate Prisma client (no env vars needed)
pnpm db:studio              # Open Prisma Studio (local)

# Deployment
pnpm deploy                 # Build for Cloudflare Pages and deploy

# D1 Remote Database
npx wrangler d1 execute aura-hype-db --remote --file=prisma/migrations/init.sql
```

## Tech Stack

- **Framework**: TanStack Start (full-stack React with SSR)
- **Routing**: TanStack Router (file-based in `src/routes/`)
- **State**: TanStack Query (server state)
- **API**: tRPC with SuperJSON transformer
- **Database**: Prisma ORM with Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 for images
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Deployment**: Cloudflare Pages

## Architecture

### File-Based Routing (`src/routes/`)
- `index.tsx` → directory path route
- `$param.tsx` → dynamic route parameter
- `$.tsx` → catch-all segment
- `__root.tsx` → root layout wrapper
- `api.*.ts` → API endpoints

### Server vs Client Code
- Files ending in `.server.ts` are server-only (excluded from client bundles)
- Database access only in `src/db.server.ts`
- Prisma client generated to `src/generated/prisma/`

### Key Directories
- `src/routes/` - File-based routes
- `src/routes/admin/` - Admin panel routes
- `src/components/ui/` - shadcn/ui components
- `src/components/admin/` - Admin-specific components
- `src/integrations/trpc/` - tRPC setup (router, init, react bindings)
- `src/integrations/trpc/routers/` - tRPC routers (products, todos)
- `src/integrations/tanstack-query/` - Query client and providers
- `src/lib/` - Utilities and helpers
- `src/data/` - Static data and constants (brands, etc.)

### Admin Panel
- `/admin` - Admin dashboard
- `/admin/products` - Product list with CRUD operations
- `/admin/products/new` - Create new product
- `/admin/products/$productId` - Edit product

### Database Setup
- **Local dev**: `file:./prisma/dev.db` (SQLite file)
- **Production**: Cloudflare D1 via `globalThis.cloudflare.env.DB` binding
- `src/db.server.ts` handles environment detection with lazy initialization
- D1 database name: `aura-hype-db`
- D1 database ID: `a30f05d6-4588-4788-86bc-9cdf11e79d49`

### R2 Storage Setup
- Bucket name: `aura-hype-listing-images`
- Binding: `IMAGES`
- Public URL: Set via `VITE_R2_PUBLIC_URL` env var
- Upload endpoint: `/api/r2-upload` (POST with multipart/form-data)
- Image retrieval: `/api/r2-image/$key` or direct from public URL

### API Endpoints
- tRPC: `/api/trpc`
- R2 upload: `/api/r2-upload` (POST)
- R2 images: `/api/r2-image/$key`

## Cloudflare Pages Deployment

### Bundle Size Constraints
- **Free plan**: 3MB worker limit
- **Paid plan**: 10MB worker limit
- Current bundle: ~2.6MB

### Heavy Dependencies to Avoid
These packages add significant bundle size and should NOT be added unless absolutely necessary:
- `streamdown` - Includes mermaid (~3MB), all syntax highlighting languages
- `highlight.js` / `shiki` - All language grammars
- `mermaid` - Diagram library (~1.5MB)
- `@tanstack/react-devtools` - Dev tools (not needed in production)
- `@tanstack/ai-*` packages - AI/chat functionality

### Deployment Process
1. Build creates `dist/` with Cloudflare Pages output
2. Wrangler deploys to Cloudflare Pages
3. D1 and R2 bindings are configured in `wrangler.toml`

### First-Time D1 Setup
After deploying, run the migration on remote D1:
```bash
npx wrangler d1 execute aura-hype-db --remote --file=prisma/migrations/init.sql
```

## Prisma + D1 Configuration

### Schema Location
- `prisma/schema.prisma` - Prisma schema
- `prisma/migrations/init.sql` - D1 migration SQL

### Prisma Client for D1
The `src/db.server.ts` uses lazy initialization with a Proxy to ensure the Prisma client is created at request time (when Cloudflare bindings are available):

```typescript
// Cloudflare Pages: globalThis.cloudflare.env.DB
// Direct Workers: globalThis.DB
```

### Regenerating Prisma Client
```bash
rm -rf src/generated/prisma && npx prisma generate
```

## Code Style

- **Formatting**: Tabs, double quotes (Biome)
- **Path aliases**: `@/*` maps to `./src/*`
- Generated files excluded from linting: `routeTree.gen.ts`, `styles.css`

## Adding shadcn Components

```bash
pnpm dlx shadcn@latest add [component-name]
```

## Environment Variables

### `.env.local` (gitignored)
```
DATABASE_URL=""                    # Leave empty for D1, or set for local SQLite
VITE_R2_PUBLIC_URL="https://..."   # R2 public bucket URL
ANTHROPIC_API_KEY=                 # Optional: for AI features
```

### Cloudflare Bindings (wrangler.toml)
- `DB` - D1 database binding
- `IMAGES` - R2 bucket binding

## Image Handling

### Upload Flow
1. Client sends image to `/api/r2-upload`
2. Server uploads to R2 (production) or saves locally (dev)
3. Returns R2 key (UUID filename)
4. Key stored in database

### Retrieval
- Use `getImageUrl(r2Key)` helper from `src/lib/utils.ts`
- Checks `VITE_R2_PUBLIC_URL` for direct R2 access
- Falls back to `/api/r2-image/$key` proxy
- In dev mode, serves from `/uploads/` directory

## Windows Development Notes

- Use `cross-env` for setting environment variables in npm scripts
- Example: `cross-env NITRO_PRESET=cloudflare-pages vite build`

## Frontend Routes Structure

### Homepage (`src/routes/index.tsx`)
- Displays products grouped by brand (limited to 5 per brand)
- Shows "View All (X)" link when brand has more than 5 products
- Horizontal carousel for each brand with scroll arrows
- Slide-out navigation menu with all brand links
- Fetches products from database via tRPC `products.list`

### Product Detail Page (`src/routes/product.$productId.tsx`)
- Shows product with image gallery (main + extra images)
- Thumbnail strip for navigation between images
- Arrow buttons for prev/next image
- Consistent navigation bar with slide-out menu
- Dark theme with glassmorphism card design
- Fetches product via tRPC `products.byId`

### Brand Pages (`src/routes/brands/*/index.tsx`)
All 12 brand pages follow the same pattern:
- **Sneaker brands**: Nike, Jordan, Asics, New Balance
- **Luxury brands**: Louis Vuitton, Amiri, Balenciaga, Bape, Dior, Dolce & Gabbana, Gucci, Prada

Each brand page:
- Fetches products filtered by brand name via tRPC
- Uses route loader for SSR prefetching
- Has slide-out navigation menu
- Auto-hiding header on scroll
- Links products to detail page

Pattern:
```typescript
export const Route = createFileRoute("/brands/[brand]/")({
  component: BrandPage,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.products.list.queryOptions({ brand: "BrandName" }),
    );
  },
});
```

### Navigation Components
All pages share:
- Hamburger menu → slide-out sidebar with brand links
- Back button (ChevronLeft) → returns to homepage
- Search button (placeholder)
- Auto-hiding header on scroll down, reappears on scroll up

Brand data is centralized in `src/data/brands.ts`:
- `sneakerBrands` - array of { name, path }
- `luxuryBrands` - array of { name, path }

## Admin Features

### Product Form (`src/components/admin/ProductForm.tsx`)
- Main image upload (single file)
- Extra images upload (multiple files at once)
- Brand selection from predefined list
- Category selection
- All uploads go to R2 (production) or `/uploads/` (dev)

### Brand List
Brands are defined in `src/data/all-brands.ts` for admin dropdown and `src/data/brands.ts` for navigation.

## Local Development Database

The `src/db.server.ts` supports both:
- **Production**: Cloudflare D1 via bindings
- **Development**: Local SQLite via `@libsql/client`

```typescript
// Falls back to local SQLite when D1 binding not available
import { createClient } from "@libsql/client";
const client = createClient({ url: "file:./prisma/dev.db" });
```

## Image URL Resolution

The `getImageUrl()` helper in `src/lib/utils.ts`:
- Detects UUID format images (locally uploaded)
- Returns `/uploads/{key}` for local dev
- Returns R2 public URL or API proxy for production