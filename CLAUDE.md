# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SciMemoCard (科研单词闪卡) is a bilingual full-stack web application for scientific vocabulary learning. It combines **contextual memory** and **spaced repetition algorithms** (based on the Ebbinghaus forgetting curve) to help research beginners efficiently master scientific terminology.

**Tech Stack:**
- **Frontend**: Next.js 16+ (App Router), React 19, TypeScript, Tailwind CSS
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: shadcn/ui (52 components)
- **Styling**: Tailwind CSS with dark mode support

**Core Learning Principles:**
- **Contextual Memory (语境记忆)**: Learn words within complete literature sentences
- **Spaced Repetition (间隔重复)**: Smart review scheduling with weighted intervals
- **Active Recall (主动回忆)**: Flip-card mechanism for active memory retrieval



### Key Data Model: Flashcard
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

All API calls go through `src/lib/api.ts` which uses:
- `NEXT_PUBLIC_API_BASE_URL` environment variable (default: `http://localhost:8000/api`)

### Flashcard Management
- `POST /api/cards/` - Create flashcard
- `GET /api/cards/` - List all flashcards
- `GET /api/cards/{id}` - Get single flashcard
- `PUT /api/cards/{id}` - Update flashcard
- `DELETE /api/cards/{id}` - Delete flashcard

### Review System
- `GET /api/cards/daily-random?limit=10` - Get daily review cards (weighted random algorithm)
- `POST /api/cards/{id}/review` - Submit review result (updates mastery and next_review time)
- `GET /api/cards/stats/overview` - Get learning statistics

### Data Export
- `GET /api/cards/export/json` - Export all flashcards as JSON

## Spaced Repetition Algorithm

Review intervals based on mastery level:
- **Level 1 (不熟 - Unfamiliar)**: 4 hours
- **Level 2 (一般 - Familiar)**: 1 day
- **Level 3 (熟练 - Mastered)**: 7 days

The `daily-random` endpoint uses **weighted random selection** - cards with lower mastery levels have higher probability of being selected for review.

## Project Structure

```
sci-memo-card/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Home (redirects to /review)
│   │   ├── globals.css          # Global styles
│   │   ├── providers.tsx        # React Query provider
│   │   ├── review/              # Review page
│   │   ├── add/                 # Add flashcard page
│   │   ├── stats/               # Statistics page
│   │   └── settings/            # Settings page
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (52 components)
│   │   ├── flashcard/           # Flashcard feature components
│   │   │   ├── FlashcardReview.tsx    # Main review component
│   │   │   ├── FlashcardDisplay.tsx   # Card display with flip
│   │   │   ├── FlashcardForm.tsx      # Add new card form
│   │   │   ├── ReviewButtons.tsx      # Rating buttons
│   │   │   └── StatsDisplay.tsx       # Statistics dashboard
│   │   ├── theme-provider.tsx   # Theme context (dark/light)
│   │   └── navigation.tsx       # Shared navigation bar
│   ├── lib/
│   │   ├── api.ts               # API client functions
│   │   ├── types.ts             # TypeScript type definitions
│   │   └── utils.ts             # Utility functions (cn, etc.)
│   └── hooks/                   # Custom React hooks
├── public/                      # Static assets
├── .env.local                   # Environment variables
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
└── tsconfig.json               # TypeScript configuration
```

## Configuration Files

### Frontend
- `next.config.mjs` - Next.js config with API URL environment variable
- `tsconfig.json` - TypeScript configuration with Next.js plugin
- `tailwind.config.ts` - Tailwind CSS with HSL color system and dark mode
- `components.json` - shadcn/ui configuration (neutral base color, default style)
- `.env.local` - Environment variables (NEXT_PUBLIC_API_BASE_URL)

### Backend (Not Currently Implemented)
The backend was originally planned but not yet implemented. API endpoints are expected at `http://localhost:8000/api`.

## State Management

### Server State (TanStack Query)
All API data is managed through TanStack Query (React Query):
- `useDailyRandomCards()` - Fetch review cards
- `useCreateFlashcard()` - Create new flashcard
- `useSubmitReview()` - Submit review results
- Query keys: `['daily-random-cards']`, `['statistics']`, etc.

### Local UI State
- React `useState` for form inputs and UI state
- Navigation state managed by Next.js App Router

## Key Components

### Navigation Component (`src/components/navigation.tsx`)
- Client component using `usePathname()` for active state
- Routes: `/review`, `/add`, `/stats`, `/settings`
- Replaces the old tab-based navigation

### Flashcard Components
- **FlashcardReview**: Main review feature with React Query integration
- **FlashcardDisplay**: Card with flip animation, word highlighting
- **FlashcardForm**: Form for adding new flashcards with validation
- **ReviewButtons**: Three-button rating system (不熟/一般/熟练)
- **StatsDisplay**: Statistics dashboard with domain distribution

## Environment Variables

Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (runs on http://localhost:3020)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Important Notes

1. **Single-user app**: No authentication/user management currently implemented
2. **API Backend**: Backend not yet implemented - API calls will fail until backend is available
3. **State Management**: TanStack Query handles server state; React useState for UI state
4. **Testing**: No testing framework configured yet
5. **Language**: This is a bilingual app (Chinese/English). UI and documentation use Chinese; code and comments in English
6. **Routing**: File-based routing via Next.js App Router (replaces old tab navigation)

## Migration from Vite

This project was migrated from Vite + React to Next.js 16+ with App Router. Key changes:
- **Entry point**: `main.tsx` → `src/app/layout.tsx`
- **Routing**: Tab-based → File-based routing
- **Build tool**: Vite → Next.js (Turbopack)
- **State management**: Local state → TanStack Query
- **Monolithic App.tsx**: Split into modular components and pages
