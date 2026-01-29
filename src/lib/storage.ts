import { Flashcard, CreateFlashcardDTO } from './types'
import { sql } from '@vercel/postgres'
import { initializeDatabase } from './db'

// Flag to track if database has been initialized
let isInitialized = false

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

/**
 * Initialize database (runs once on first access)
 */
async function ensureInitialized(): Promise<void> {
  if (!isInitialized) {
    try {
      await initializeDatabase()
      await initializeSampleData()
      isInitialized = true
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw error
    }
  }
}

/**
 * Initialize database with sample data if empty
 */
async function initializeSampleData(): Promise<void> {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM flashcards`
    const count = Number(result.rows[0]?.count || 0)

    if (count === 0) {
      console.log('Database is empty, inserting initial sample data...')
      for (const data of INITIAL_DATA) {
        await sql`
          INSERT INTO flashcards (sentence, word, translation, definition, domain, mastery, review_count, next_review, created_at)
          VALUES (${data.sentence}, ${data.word}, ${data.translation}, ${data.definition}, ${data.domain}, 1, 0, NOW(), NOW())
        `
      }
      console.log('Sample data inserted successfully')
    }
  } catch (error) {
    console.error('Failed to initialize sample data:', error)
  }
}

/**
 * Convert database row to Flashcard type
 */
function rowToFlashcard(row: any): Flashcard {
  return {
    id: row.id,
    sentence: row.sentence,
    word: row.word,
    translation: row.translation,
    definition: row.definition,
    domain: row.domain,
    mastery: row.mastery,
    review_count: row.review_count,
    next_review: row.next_review,
    created_at: row.created_at
  }
}

// Storage API with Postgres backend
export const storage = {
  /**
   * Get all flashcards, ordered by creation date (newest first)
   */
  async getAll(): Promise<Flashcard[]> {
    await ensureInitialized()
    try {
      const result = await sql`
        SELECT id, sentence, word, translation, definition, domain, mastery, review_count, next_review, created_at
        FROM flashcards
        ORDER BY created_at DESC
      `
      return result.rows.map(rowToFlashcard)
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
      const result = await sql`
        SELECT id, sentence, word, translation, definition, domain, mastery, review_count, next_review, created_at
        FROM flashcards
        WHERE id = ${id}
      `
      if (result.rows.length === 0) {
        return null
      }
      return rowToFlashcard(result.rows[0])
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
      const result = await sql`
        INSERT INTO flashcards (sentence, word, translation, definition, domain, mastery, review_count, next_review, created_at)
        VALUES (${data.sentence}, ${data.word}, ${data.translation}, ${data.definition || ''}, ${data.domain || '通用'}, 1, 0, NOW(), NOW())
        RETURNING id, sentence, word, translation, definition, domain, mastery, review_count, next_review, created_at
      `
      return rowToFlashcard(result.rows[0])
    } catch (error) {
      console.error('Failed to create flashcard:', error)
      throw error
    }
  },

  /**
   * Update flashcard
   */
  async update(id: number, updates: Partial<Flashcard>): Promise<Flashcard | null> {
    await ensureInitialized()
    try {
      // Build dynamic SET clause based on provided fields
      const updateFields: string[] = []
      const values: any[] = []
      let paramIndex = 1

      if (updates.sentence !== undefined) {
        updateFields.push(`sentence = $${paramIndex++}`)
        values.push(updates.sentence)
      }
      if (updates.word !== undefined) {
        updateFields.push(`word = $${paramIndex++}`)
        values.push(updates.word)
      }
      if (updates.translation !== undefined) {
        updateFields.push(`translation = $${paramIndex++}`)
        values.push(updates.translation)
      }
      if (updates.definition !== undefined) {
        updateFields.push(`definition = $${paramIndex++}`)
        values.push(updates.definition)
      }
      if (updates.domain !== undefined) {
        updateFields.push(`domain = $${paramIndex++}`)
        values.push(updates.domain)
      }
      if (updates.mastery !== undefined) {
        updateFields.push(`mastery = $${paramIndex++}`)
        values.push(updates.mastery)
      }
      if (updates.review_count !== undefined) {
        updateFields.push(`review_count = $${paramIndex++}`)
        values.push(updates.review_count)
      }
      if (updates.next_review !== undefined) {
        updateFields.push(`next_review = $${paramIndex++}`)
        values.push(updates.next_review)
      }

      if (updateFields.length === 0) {
        return await this.getById(id)
      }

      values.push(id)
      const setClause = updateFields.join(', ')
      const query = `
        UPDATE flashcards
        SET ${setClause}
        WHERE id = $${paramIndex}
        RETURNING id, sentence, word, translation, definition, domain, mastery, review_count, next_review, created_at
      `

      const result = await sql.query(query, values)
      if (result.rows.length === 0) {
        return null
      }
      return rowToFlashcard(result.rows[0])
    } catch (error) {
      console.error('Failed to update flashcard:', error)
      throw error
    }
  },

  /**
   * Delete flashcard
   */
  async delete(id: number): Promise<boolean> {
    await ensureInitialized()
    try {
      const result = await sql`
        DELETE FROM flashcards
        WHERE id = ${id}
        RETURNING id
      `
      return result.rows.length > 0
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
      await sql`TRUNCATE TABLE flashcards`
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
      const now = new Date().toISOString()

      // First try to get cards that are due for review
      const dueResult = await sql`
        SELECT id, sentence, word, translation, definition, domain, mastery, review_count, next_review, created_at
        FROM flashcards
        WHERE next_review <= ${now}
        ORDER BY mastery ASC, RANDOM()
        LIMIT ${limit * 2}
      `

      if (dueResult.rows.length > 0) {
        // Apply weighted selection from due cards
        const dueCards = dueResult.rows.map(rowToFlashcard)

        // Weight cards: lower mastery = higher weight
        const weightedCards: Array<{ card: Flashcard; weight: number }> = dueCards.map(card => ({
          card,
          weight: 4 - card.mastery // mastery 1 = weight 3, mastery 2 = weight 2, mastery 3 = weight 1
        }))

        // Fisher-Yates shuffle with weights
        for (let i = weightedCards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[weightedCards[i], weightedCards[j]] = [weightedCards[j], weightedCards[i]]
        }

        // Sort by weight (descending) and take top N
        weightedCards.sort((a, b) => b.weight - a.weight)
        return weightedCards.slice(0, Math.min(limit, weightedCards.length)).map(w => w.card)
      }

      // No cards due, return cards with lowest mastery
      const fallbackResult = await sql`
        SELECT id, sentence, word, translation, definition, domain, mastery, review_count, next_review, created_at
        FROM flashcards
        ORDER BY mastery ASC, created_at DESC
        LIMIT ${limit}
      `
      return fallbackResult.rows.map(rowToFlashcard)
    } catch (error) {
      console.error('Failed to get daily random cards:', error)
      return []
    }
  },

  /**
   * Get statistics overview
   */
  async getStats() {
    await ensureInitialized()
    try {
      // Get total and mastered counts
      const countResult = await sql`
        SELECT
          COUNT(*) as total_cards,
          COUNT(*) FILTER (WHERE mastery = 3) as mastered_cards
        FROM flashcards
      `
      const totalCards = Number(countResult.rows[0]?.total_cards || 0)
      const masteredCards = Number(countResult.rows[0]?.mastered_cards || 0)
      const masteryRate = totalCards > 0 ? (masteredCards / totalCards) * 100 : 0

      // Get domain distribution
      const domainResult = await sql`
        SELECT domain, COUNT(*) as count
        FROM flashcards
        GROUP BY domain
        ORDER BY count DESC
      `
      const domainDistribution: Record<string, number> = {}
      domainResult.rows.forEach(row => {
        domainDistribution[row.domain] = Number(row.count)
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
