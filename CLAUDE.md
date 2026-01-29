# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working with this repository.

## Project Overview

SciMemoCard (科研单词闪卡) - Bilingual full-stack web app for scientific vocabulary learning with contextual memory and spaced repetition.

**Tech Stack:**
- **Frontend**: Next.js 16+ (App Router), React 19, TypeScript, Tailwind CSS
- **State**: TanStack Query (React Query)
- **UI**: shadcn/ui (52 components)
- **Package Manager**: pnpm

## Key Data Model: Flashcard

```typescript
{
  id: number
  sentence: string         // Complete literature sentence
  word: string            // Target vocabulary word
  translation: string     // Chinese translation
  definition: string      // Academic definition
  domain: string         // Subject field (default: "通用")
  mastery: 1 | 2 | 3    // 1=unfamiliar, 2=familiar, 3=mastered
  next_review: string    // ISO date string for next review
  review_count: number   // Number of reviews
  created_at: string     // ISO date string
}
```

## API Endpoints

Base URL: `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:8000/api`)

### Flashcard Management
- `POST /api/cards/` - Create flashcard
- `GET /api/cards/` - List all flashcards
- `GET /api/cards/{id}` - Get single flashcard
- `PUT /api/cards/{id}` - Update flashcard
- `DELETE /api/cards/{id}` - Delete flashcard

### Review System
- `GET /api/cards/daily-random?limit=10` - Get daily review cards (weighted random)
- `POST /api/cards/{id}/review` - Submit review result
- `GET /api/cards/stats/overview` - Get learning statistics

### Data Export
- `GET /api/cards/export/json` - Export all flashcards as JSON

## Spaced Repetition Algorithm

Review intervals based on mastery level:
- **Level 1 (不熟 - Unfamiliar)**: 4 hours
- **Level 2 (一般 - Familiar)**: 1 day
- **Level 3 (熟练 - Mastered)**: 7 days

The `daily-random` endpoint uses **weighted random selection** - cards with lower mastery levels have higher probability.

## Development Commands

```bash
# Install dependencies
pnpm install

# Start dev server (http://localhost:3020)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home (redirects to /review)
│   ├── globals.css          # Global styles
│   ├── providers.tsx        # React Query provider
│   ├── review/              # Review page
│   ├── add/                 # Add flashcard page
│   ├── stats/               # Statistics page
│   ├── settings/            # Settings page
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # shadcn/ui components (52 components)
│   ├── flashcard/           # Flashcard feature components
│   │   ├── FlashcardReview.tsx    # Main review component
│   │   ├── FlashcardDisplay.tsx   # Card display with flip
│   │   ├── FlashcardForm.tsx      # Add new card form
│   │   ├── ReviewButtons.tsx      # Rating buttons
│   │   └── StatsDisplay.tsx       # Statistics dashboard
│   ├── theme-provider.tsx   # Theme context (dark/light)
│   └── navigation.tsx       # Shared navigation bar
├── lib/
│   ├── api.ts               # API client functions
│   ├── types.ts             # TypeScript type definitions
│   └── storage.ts           # Local file-based storage
└── hooks/                   # Custom React hooks
```

## Configuration Files

- `next.config.mjs` - Next.js config with API URL env var
- `tsconfig.json` - TypeScript with Next.js plugin
- `tailwind.config.ts` - Tailwind CSS with HSL colors and dark mode
- `eslint.config.mjs` - ESLint 9 flat config (typescript-eslint, react-hooks, react-refresh)
- `.env.local` - Environment variables (NEXT_PUBLIC_API_BASE_URL)

## ESLint Configuration

ESLint 9 with flat config format:
- **typescript-eslint** - Type checking
- **react-hooks** - React hooks rules
- **react-refresh** - Fast refresh (disabled for UI library components)
- **@next/eslint-plugin-next** - Next.js specific rules
- **react-hooks/purity** - Disabled (too strict for skeleton loaders)

## Important Notes

1. **Single-user app**: No authentication/user management
2. **Storage**: Local file-based storage (flashcards-data.json)
3. **State Management**: TanStack Query for server state, React useState for UI state
4. **Language**: Bilingual (Chinese UI, English code/comments)
5. **Routing**: File-based via Next.js App Router
6. **Package Manager**: Uses `pnpm` (not npm or yarn)

## Migration from Vite

Migrated from Vite + React to Next.js 16+:
- **Entry**: `main.tsx` → `src/app/layout.tsx`
- **Routing**: Tab-based → File-based routing
- **Build**: Vite → Next.js (Turbopack)
- **State**: Local state → TanStack Query
- **Components**: Monolithic App.tsx → Modular pages and components
