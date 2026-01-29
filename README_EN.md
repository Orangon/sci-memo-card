# SciMemoCard - Scientific Vocabulary Flashcards

An intelligent flashcard web application combining **contextual memory** and **spaced repetition algorithms** to help research beginners efficiently master scientific terminology.

## ✨ Key Features

- 📝 **Contextual Vocabulary Learning** - Learn words within complete literature sentences
- 🎯 **Smart Flashcard Review** - Intelligent review intervals based on Ebbinghaus forgetting curve
- ⭐ **Mastery Level Scoring** - Three levels: Unfamiliar (1) / Familiar (2) / Mastered (3)
- 📊 **Learning Statistics** - Track vocabulary count, mastery rate, and subject distribution

## 🛠️ Tech Stack

Next.js 16 + React 19 + TypeScript + Tailwind CSS + shadcn/ui + TanStack Query

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server (http://localhost:3020)
pnpm dev

# Lint code
pnpm lint

# Build
pnpm build
```

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router (pages + API routes)
├── components/       # React components (ui/ + flashcard/)
├── hooks/            # Custom Hooks
└── lib/              # Utilities (api.ts, storage.ts, types.ts)
```

## 📊 Data Model

```typescript
interface Flashcard {
  id: number
  sentence: string       // Complete literature sentence
  word: string          // Target vocabulary word
  translation: string   // Chinese translation
  definition: string    // Academic definition
  domain: string       // Subject field (default: "通用")
  mastery: 1 | 2 | 3  // 1=unfamiliar, 2=familiar, 3=mastered
  next_review: string  // Next review time (ISO date)
  review_count: number // Review count
  created_at: string   // Creation time (ISO date)
}
```

## 🔧 API Endpoints

- `GET/POST /api/cards` - Get/create flashcards
- `GET/PUT/DELETE /api/cards/{id}` - Operate on single flashcard
- `GET /api/cards/daily-random` - Get daily review cards
- `POST /api/cards/{id}/review` - Submit review result
- `GET /api/cards/stats/overview` - Get statistics

## 🎯 Spaced Repetition Algorithm

- **Level 1 (Unfamiliar)**: Review in 4 hours
- **Level 2 (Familiar)**: Review in 1 day
- **Level 3 (Mastered)**: Review in 7 days

Daily review cards use **weighted random selection** - cards with lower mastery levels have higher probability.

## 📝 Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## 📄 License

MIT License

---

**[中文文档](README.md)**
