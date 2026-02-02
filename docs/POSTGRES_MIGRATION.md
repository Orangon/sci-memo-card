# Postgres Migration Summary

## Completed Changes

### 1. Installed Dependencies
- Added `@vercel/postgres@^0.10.0` to package.json

### 2. New Files Created

#### `/src/lib/db.ts`
Database connection and initialization:
- `initializeDatabase()` - Creates tables and indexes
- `testConnection()` - Tests database connectivity
- `getFlashcardCount()` - Returns count of flashcards

#### `/src/lib/migrations.ts`
Data migration utilities:
- `migrateFromJsonFile()` - Migrates data from flashcards-data.json to Postgres
- `exportToJson()` - Exports database to JSON for backup

#### `/src/app/api/cards/[id]/route.ts`
Individual card operations:
- `GET /api/cards/[id]` - Get single flashcard
- `PUT /api/cards/[id]` - Update flashcard
- `DELETE /api/cards/[id]` - Delete flashcard

### 3. Modified Files

#### `/src/lib/storage.ts`
**Complete rewrite** - Replaced file operations with SQL queries:
- All functions now use Postgres via `@vercel/postgres`
- Auto-initialization on first access via `ensureInitialized()`
- Same function signatures maintained for backward compatibility

#### `/src/app/api/cards/route.ts`
Added `GET` handler to list all flashcards

#### `/.env.local`
Added Postgres environment variable documentation

## Deployment Steps

### Step 1: Push to Git
```bash
git add .
git commit -m "feat: migrate from file storage to Vercel Postgres"
git push
```

### Step 2: Create Vercel Postgres Database
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **Postgres** (Hobby plan is free)
6. Click **Create**

Vercel will automatically add these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Step 3: Deploy
After creating the database, Vercel will automatically redeploy with the new environment variables.

### Step 4: Migrate Existing Data (Optional)
If you have existing data in `flashcards-data.json`:

1. Create a temporary API endpoint or script to run migration:
```typescript
// Add this to a temporary migration route
import { migrateFromJsonFile } from '@/lib/migrations'

export async function GET() {
  const count = await migrateFromJsonFile()
  return Response.json({ migrated: count })
}
```

2. Visit this endpoint once to migrate data
3. Remove the temporary endpoint

## Testing Checklist

After deployment, test these operations:

- [ ] **Create flashcard** - Add a new card via `/add` page
- [ ] **List cards** - View all cards in settings
- [ ] **Update card** - Edit a card's details
- [ ] **Delete card** - Remove a card
- [ ] **Review flow** - Complete a review session
- [ ] **Statistics** - Check stats page for accurate counts
- [ ] **Import/Export** - Test JSON import/export

## Database Schema

```sql
CREATE TABLE flashcards (
  id SERIAL PRIMARY KEY,
  sentence TEXT NOT NULL,
  word VARCHAR(255) NOT NULL,
  translation TEXT NOT NULL,
  definition TEXT DEFAULT '',
  domain VARCHAR(100) DEFAULT '通用',
  mastery INTEGER NOT NULL DEFAULT 1 CHECK (mastery IN (1, 2, 3)),
  review_count INTEGER NOT NULL DEFAULT 0,
  next_review TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_next_review ON flashcards(next_review);
CREATE INDEX idx_domain ON flashcards(domain);
CREATE INDEX idx_mastery ON flashcards(mastery);
```

## Rollback Plan

If issues occur:

1. Export database to JSON first:
   ```typescript
   import { exportToJson } from '@/lib/migrations'
   const backup = await exportToJson()
   ```

2. Revert the code changes:
   ```bash
   git revert HEAD
   git push
   ```

3. The old file-based storage will work again

## Local Development with Postgres

To run locally with Postgres:

### Option 1: Use Vercel CLI
```bash
npm i -g vercel
vercel link
vercel env pull .env.local
pnpm dev
```

### Option 2: Use Local Postgres
Install PostgreSQL locally and set in `.env.local`:
```bash
POSTGRES_URL="postgresql://user:password@localhost:5432/scimemocard"
```

## Troubleshooting

### "Database connection failed"
- Verify environment variables are set in Vercel
- Check Postgres database is provisioned

### "Table does not exist"
- Database auto-initializes on first request
- Try visiting any page to trigger initialization

### "Data not persisting"
- Verify you're using the deployed URL, not local
- Check Vercel logs for errors
