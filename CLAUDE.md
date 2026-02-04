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

# Database (Drizzle + D1)
npx prisma generate         # Generate Prisma client (legacy, may not be needed)
pnpm db:studio              # Open Prisma Studio (local)

# Deployment
pnpm run deploy             # Build for Cloudflare Pages and deploy (use `run` to avoid pnpm built-in)

# D1 Remote Database
npx wrangler d1 execute aura-hype-db --remote --file=prisma/migrations/init.sql
```

## Tech Stack

- **Framework**: TanStack Start (full-stack React with SSR)
- **Routing**: TanStack Router (file-based in `src/routes/`)
- **State**: TanStack Query (server state)
- **API**: tRPC with SuperJSON transformer
- **Database**: Drizzle ORM with Cloudflare D1 (SQLite)
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
- Database access only in `src/db.server.ts` (uses Drizzle ORM with D1)
- Drizzle schema defined in `src/db/schema.ts`

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
1. `pnpm run deploy` builds with `cloudflare-pages` preset and deploys
2. Build creates `dist/` with `_worker.js/index.js` (single inlined bundle)
3. D1 and R2 bindings are configured in `wrangler.toml`
4. Deploys to preview URLs by default (branch-based); production requires deploying from `main`

### Current Deployment
- **Cloudflare Pages project**: `aura-hype-web`
- **Production URL**: `aura-hype-web.pages.dev` (no production deployment yet)
- **Preview URL pattern**: `<hash>.aura-hype-web.pages.dev`
- **Branch alias**: `deployment-workers.aura-hype-web.pages.dev`

### First-Time D1 Setup
After deploying, run the migration on remote D1:
```bash
npx wrangler d1 execute aura-hype-db --remote --file=prisma/migrations/init.sql
```

## Drizzle + D1 Configuration

### Schema Location
- `src/db/schema.ts` - Drizzle schema (products, extraImages, todos tables)
- `prisma/migrations/init.sql` - D1 migration SQL (still used for remote D1 setup)

### Database Access
`src/db.server.ts` uses `getDb()` with lazy initialization. It detects D1 bindings at request time:

```typescript
// Cloudflare Pages: globalThis.cloudflare.env.DB
// Direct Workers: globalThis.DB
// Nitro pattern: globalThis.__env__.DB
```

If no D1 binding is found, it throws an error (local dev should use `pnpm dev` which provides its own environment).

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

## Image URL Resolution

The `getImageUrl()` helper in `src/lib/utils.ts`:
- Detects UUID format images (locally uploaded)
- Returns `/uploads/{key}` for local dev
- Returns R2 public URL or API proxy for production

## Nitro Configuration (Critical)

The `nitro.config.ts` must use these settings for Cloudflare Pages deployment:

```typescript
export default defineNitroConfig({
  preset: "cloudflare-pages",
  rollupConfig: {
    output: {
      inlineDynamicImports: true,
    },
  },
});
```

### Why these settings matter
- **`preset: "cloudflare-pages"`**: Must match the deployment target. Using `cloudflare-module` causes the `__name is not defined` error in the browser because the SSR streaming output format differs.
- **`inlineDynamicImports: true`**: Without this, Nitro generates code-split chunks that reference `../../index.js` with broken relative paths, causing `Could not resolve` errors at runtime.

### `__name` Polyfill
The `__root.tsx` shell includes an inline `<script>` that defines esbuild's `__name` helper before any SSR-streamed scripts execute. This is required because Nitro's server bundle uses esbuild's `keepNames` transform, and the dehydrated data stream contains `__name()` calls that run in the browser context where this helper doesn't exist.

```tsx
<script dangerouslySetInnerHTML={{
  __html: `var __name=(fn,n)=>(Object.defineProperty(fn,"name",{value:n,configurable:true}),fn);`,
}} />
```

Do NOT remove this polyfill - it will cause a blank page on Cloudflare deployments.

## SSR on Cloudflare

- SSR prefetching is skipped on Cloudflare because the worker cannot make HTTP requests to itself during SSR
- The `isCloudflare()` helper in `src/integrations/tanstack-query/root-provider.tsx` detects the Cloudflare environment
- Route loaders should check `isCloudflare()` and skip `prefetchQuery` calls when true
- Data is fetched client-side after hydration instead