# Migration to Cloudflare D1

## Changes Made

### 1. Updated Prisma Schema
- Changed provider from `postgresql` to `sqlite` (D1 uses SQLite)
- Added a local development database URL: `file:./dev.db`

### 2. Updated Database Client ([src/db.ts](src/db.ts))
- Replaced `@prisma/adapter-pg` with `@prisma/adapter-d1`
- Added logic to detect D1 binding (for Cloudflare Workers)
- Throws an error if D1 binding is not available

### 3. Created Wrangler Configuration ([wrangler.toml](wrangler.toml))
- Added D1 database binding configuration
- Set up local development environment

## Next Steps

### 1. Install Wrangler (if not already installed)
```bash
pnpm add -D wrangler
```

### 2. Create a D1 Database
```bash
pnpm wrangler d1 create aura-hype-db
```

This will output a database ID. Copy it and paste it into the `wrangler.toml` file under `database_id`.

### 3. Run Migrations
For local development:
```bash
pnpm wrangler d1 migrations apply aura-hype-db --local
```

For production:
```bash
pnpm wrangler d1 migrations apply aura-hype-db --remote
```

### 4. Generate SQL Migrations from Prisma
Since D1 doesn't support `prisma migrate` directly, you need to:

1. Generate the SQL migration:
```bash
pnpm prisma migrate dev --name init --create-only
```

2. Find the generated SQL in `prisma/migrations/`
3. Apply it to D1:
```bash
pnpm wrangler d1 execute aura-hype-db --local --file=./prisma/migrations/[timestamp]_init/migration.sql
```

### 5. Update Your Dev Script
Add to `package.json`:
```json
{
  "scripts": {
    "dev:d1": "wrangler dev --local",
    "deploy": "wrangler deploy"
  }
}
```

### 6. For Local Development
The current setup uses a local SQLite file (`file:./dev.db`). When running with Wrangler, the D1 binding will be available:

```bash
pnpm wrangler dev --local --persist
```

## Important Notes

### Database Schema Differences
- **Auto-increment**: Works the same in SQLite/D1
- **DateTime**: SQLite stores dates as strings, make sure your application handles this
- **No native UUID**: If you need UUIDs, use `String` type with `@default(uuid())`

### Current Model
Your `Todo` model should work without changes:
```prisma
model Todo {
  id        Int      @id @default(autoincrement())
  title     String
  createdAt DateTime @default(now())
}
```

### Environment Variables
- Local development: Uses `file:./dev.db` (defined in schema)
- Production: Uses D1 binding from Cloudflare Workers (no URL needed)

### Cleanup
You can now remove the PostgreSQL adapter:
```bash
pnpm remove @prisma/adapter-pg
```

## Testing

1. Push the schema to your local D1:
```bash
pnpm db:push
```

2. Run your application with Wrangler:
```bash
pnpm wrangler dev --local
```

3. Test your database operations through your application

## Deployment

When deploying to Cloudflare:

1. Create the production database:
```bash
pnpm wrangler d1 create aura-hype-db
```

2. Apply migrations:
```bash
pnpm wrangler d1 migrations apply aura-hype-db --remote
```

3. Deploy your application:
```bash
pnpm wrangler deploy
```
