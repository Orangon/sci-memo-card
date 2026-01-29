# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SciMemoCard (科研单词闪卡) is a bilingual full-stack web application for scientific vocabulary learning. It combines **contextual memory** and **spaced repetition algorithms** (based on the Ebbinghaus forgetting curve) to help research beginners efficiently master scientific terminology.

**Core Learning Principles:**
- **Contextual Memory (语境记忆)**: Learn words within complete literature sentences
- **Spaced Repetition (间隔重复)**: Smart review scheduling with weighted intervals
- **Active Recall (主动回忆)**: Flip-card mechanism for active memory retrieval



### Key Data Model: Flashcard
```python
{
    id: int
    sentence: str           # Complete literature sentence
    word: str              # Target vocabulary word
    translation: str       # Chinese translation
    definition: str        # Academic definition
    domain: str           # Subject field (default: "通用")
    mastery: int          # 1-3 (unfamiliar/familiar/mastered)
    next_review: datetime # Next review time
    review_count: int     # Number of reviews
    created_at: datetime
    updated_at: datetime
}
```

## API Endpoints

### Flashcard Management
- `POST /api/cards/` - Create flashcard
- `GET /api/cards/` - List all flashcards
- `GET /api/cards/{id}` - Get single flashcard
- `PUT /api/cards/{id}` - Update flashcard
- `DELETE /api/cards/{id}` - Delete flashcard

### Review System
- `GET /api/cards/daily-random` - Get daily review cards (weighted random algorithm based on mastery level)
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

## Configuration Files

### Frontend
- `vite.config.ts` - Vite config with React plugin and `@/*` path alias
- `tsconfig.json` - TypeScript strict mode configuration
- `tailwind.config.ts` - Tailwind CSS with HSL color system and dark mode
- `components.json` - shadcn/ui configuration (neutral base color, default style)

### Backend
- `backend/.env` - Environment variables (DATABASE_URL, CORS settings)
- `backend/requirements.txt` - 14 Python dependencies

## Important Notes

1. **Single-user app**: No authentication/user management currently implemented
2. **Database**: SQLite for development; can migrate to PostgreSQL for production
3. **Frontend state**: Currently uses local component state - consider React Query or Zustand for more complex state management
4. **Testing**: Backend has pytest configured; frontend has no testing framework yet
5. **Language**: This is a bilingual app (Chinese/English). UI and documentation use Chinese; code and comments in English
