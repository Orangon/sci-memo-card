import { prisma } from './prisma'
import { Flashcard, CreateFlashcardDTO, StatsOverview } from './types'

// Initial sample data (used when database is empty)
const INITIAL_DATA: Omit<Flashcard, 'id' | 'next_review' | 'created_at' | 'mastery' | 'review_count'>[] = [
  {
    sentence: 'The hypothesis was corroborated by empirical evidence from multiple experiments.',
    word: 'corroborated',
    translation: '证实，确证',
    definition: 'To confirm or give support to a statement, theory, or finding.',
    domain: '通用'
  },
  {
    sentence: 'The researchers identified a statistically significant correlation between the variables.',
    word: 'correlation',
    translation: '相关性',
    definition: 'A mutual relationship or connection between two or more things.',
    domain: '统计学'
  },
  {
    sentence: 'The methodology section describes the experimental design in detail.',
    word: 'methodology',
    translation: '方法论',
    definition: 'A system of methods used in a particular area of study or activity.',
    domain: '科研方法'
  }
]

// Flag to track if database has been initialized
let isInitialized = false

/**
 * Initialize database with sample data if empty
 */
async function ensureInitialized(): Promise<void> {
  if (!isInitialized) {
    try {
      await initializeSampleData()
      isInitialized = true
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw error
    }
  }
}

async function initializeSampleData(): Promise<void> {
  try {
    const count = await prisma.flashcard.count()

    if (count === 0) {
      console.log('Database is empty, inserting initial sample data...')
      for (const data of INITIAL_DATA) {
        await prisma.flashcard.create({
          data: {
            sentence: data.sentence,
            word: data.word,
            translation: data.translation,
            definition: data.definition,
            domain: data.domain,
            mastery: 1,
            reviewCount: 0
          }
        })
      }
      console.log('Sample data inserted successfully')
    }
  } catch (error) {
    console.error('Failed to initialize sample data:', error)
  }
}

/**
 * Convert Prisma model to Flashcard type
 */
function toFlashcard(prismaCard: {
  id: number
  sentence: string
  word: string
  translation: string
  definition: string | null
  domain: string
  mastery: number
  reviewCount: number
  nextReview: Date
  createdAt: Date
}): Flashcard {
  return {
    id: prismaCard.id,
    sentence: prismaCard.sentence,
    word: prismaCard.word,
    translation: prismaCard.translation,
    definition: prismaCard.definition || '',
    domain: prismaCard.domain,
    mastery: prismaCard.mastery as 1 | 2 | 3,
    review_count: prismaCard.reviewCount,
    next_review: prismaCard.nextReview.toISOString(),
    created_at: prismaCard.createdAt.toISOString()
  }
}

// Database Repository with Prisma
export const dbRepository = {
  /**
   * Get all flashcards, ordered by creation date (newest first)
   */
  async getAll(): Promise<Flashcard[]> {
    await ensureInitialized()
    try {
      const cards = await prisma.flashcard.findMany({
        orderBy: { createdAt: 'desc' }
      })
      return cards.map(toFlashcard)
    } catch (error) {
      console.error('Failed to get all flashcards:', error)
      return []
    }
  },

  /**
   * Get flashcard by ID
   */
  async getById(id: number): Promise<Flashcard | null> {
    await ensureInitialized()
    try {
      const card = await prisma.flashcard.findUnique({
        where: { id }
      })
      return card ? toFlashcard(card) : null
    } catch (error) {
      console.error('Failed to get flashcard by id:', error)
      return null
    }
  },

  /**
   * Create new flashcard
   */
  async create(data: CreateFlashcardDTO): Promise<Flashcard> {
    await ensureInitialized()
    try {
      const card = await prisma.flashcard.create({
        data: {
          sentence: data.sentence,
          word: data.word,
          translation: data.translation,
          definition: data.definition || '',
          domain: data.domain || '通用',
          mastery: 1,
          reviewCount: 0
        }
      })
      return toFlashcard(card)
    } catch (error) {
      console.error('Failed to create flashcard:', error)
      throw error
    }
  },

  /**
   * Update flashcard
   */
  async update(id: number, updates: Partial<Omit<Flashcard, 'id' | 'created_at'>>): Promise<Flashcard | null> {
    await ensureInitialized()
    try {
      const card = await prisma.flashcard.update({
        where: { id },
        data: {
          ...(updates.sentence !== undefined && { sentence: updates.sentence }),
          ...(updates.word !== undefined && { word: updates.word }),
          ...(updates.translation !== undefined && { translation: updates.translation }),
          ...(updates.definition !== undefined && { definition: updates.definition }),
          ...(updates.domain !== undefined && { domain: updates.domain }),
          ...(updates.mastery !== undefined && { mastery: updates.mastery }),
          ...(updates.review_count !== undefined && { reviewCount: updates.review_count }),
          ...(updates.next_review !== undefined && { nextReview: new Date(updates.next_review) })
        }
      })
      return toFlashcard(card)
    } catch (error) {
      console.error('Failed to update flashcard:', error)
      return null
    }
  },

  /**
   * Delete flashcard
   */
  async delete(id: number): Promise<boolean> {
    await ensureInitialized()
    try {
      await prisma.flashcard.delete({
        where: { id }
      })
      return true
    } catch (error) {
      console.error('Failed to delete flashcard:', error)
      return false
    }
  },

  /**
   * Clear all flashcards
   */
  async clear(): Promise<void> {
    await ensureInitialized()
    try {
      await prisma.flashcard.deleteMany({})
    } catch (error) {
      console.error('Failed to clear flashcards:', error)
      throw error
    }
  },

  /**
   * Get daily random cards for review (weighted by mastery level)
   * Lower mastery level = higher probability of being selected
   */
  async getDailyRandom(limit: number = 10): Promise<Flashcard[]> {
    await ensureInitialized()
    try {
      const now = new Date()

      // Get cards that are due for review
      const dueCards = await prisma.flashcard.findMany({
        where: {
          nextReview: { lte: now }
        },
        orderBy: [{ mastery: 'asc' }]
      })

      if (dueCards.length > 0) {
        // Apply weighted selection: lower mastery = higher weight
        const weightedCards: Array<{ card: typeof dueCards[0]; weight: number }> = dueCards.map(card => ({
          card,
          weight: 4 - card.mastery // mastery 1 = weight 3, mastery 2 = weight 2, mastery 3 = weight 1
        }))

        // Shuffle for randomness
        for (let i = weightedCards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[weightedCards[i], weightedCards[j]] = [weightedCards[j], weightedCards[i]]
        }

        // Sort by weight (descending) and take top N
        weightedCards.sort((a, b) => b.weight - a.weight)
        return weightedCards.slice(0, Math.min(limit, weightedCards.length)).map(w => toFlashcard(w.card))
      }

      // No cards due, return cards with lowest mastery
      const fallbackCards = await prisma.flashcard.findMany({
        orderBy: [{ mastery: 'asc' }, { createdAt: 'desc' }],
        take: limit
      })
      return fallbackCards.map(toFlashcard)
    } catch (error) {
      console.error('Failed to get daily random cards:', error)
      return []
    }
  },

  /**
   * Get statistics overview
   */
  async getStats(): Promise<StatsOverview> {
    await ensureInitialized()
    try {
      // Get total and mastered counts
      const [totalCards, masteredCards] = await Promise.all([
        prisma.flashcard.count(),
        prisma.flashcard.count({ where: { mastery: 3 } })
      ])
      const masteryRate = totalCards > 0 ? (masteredCards / totalCards) * 100 : 0

      // Get domain distribution using groupBy
      const domainGroups = await prisma.flashcard.groupBy({
        by: ['domain'],
        _count: { domain: true },
        orderBy: { _count: { domain: 'desc' } }
      })

      const domainDistribution: Record<string, number> = {}
      domainGroups.forEach(group => {
        domainDistribution[group.domain] = group._count.domain
      })

      return {
        total_cards: totalCards,
        mastered_cards: masteredCards,
        mastery_rate: Math.round(masteryRate * 10) / 10,
        domain_distribution: domainDistribution
      }
    } catch (error) {
      console.error('Failed to get stats:', error)
      return {
        total_cards: 0,
        mastered_cards: 0,
        mastery_rate: 0,
        domain_distribution: {}
      }
    }
  }
}
