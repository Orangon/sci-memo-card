'use client'

import { db, FlashcardSchema, PresetDomainSchema } from './indexeddb'
import {
  Flashcard,
  CreateFlashcardDTO,
  StatsOverview,
  PresetDomain
} from './types'

// Initial preset domains to create on first run
const INITIAL_PRESET_DOMAINS = ['通用', '心理学', 'DSM', 'GIS', 'LLM']

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
      await initializePresetDomains()
      isInitialized = true
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw error
    }
  }
}

async function initializeSampleData(): Promise<void> {
  try {
    const count = await db.flashcards.count()

    if (count === 0) {
      console.log('Database is empty, inserting initial sample data...')
      const now = new Date().toISOString()
      for (const data of INITIAL_DATA) {
        await db.flashcards.add({
          sentence: data.sentence,
          word: data.word,
          translation: data.translation,
          definition: data.definition,
          domain: data.domain,
          mastery: 1,
          review_count: 0,
          next_review: now,
          created_at: now
        })
      }
      console.log('Sample data inserted successfully')
    }
  } catch (error) {
    console.error('Failed to initialize sample data:', error)
  }
}

/**
 * Initialize preset domains if not exists
 */
async function initializePresetDomains(): Promise<void> {
  try {
    const count = await db.presetDomains.count()
    if (count === 0) {
      console.log('Initializing preset domains...')
      const now = new Date().toISOString()
      await Promise.all(
        INITIAL_PRESET_DOMAINS.map(name =>
          db.presetDomains.add({ name, created_at: now })
        )
      )
      console.log('Preset domains initialized successfully')
    }
  } catch (error) {
    console.error('Failed to initialize preset domains:', error)
  }
}

/**
 * Convert IndexedDB schema to Flashcard type
 */
function toFlashcard(schema: FlashcardSchema): Flashcard {
  return {
    id: schema.id!,
    sentence: schema.sentence,
    word: schema.word,
    translation: schema.translation,
    definition: schema.definition || '',
    domain: schema.domain,
    mastery: schema.mastery,
    review_count: schema.review_count,
    next_review: schema.next_review,
    created_at: schema.created_at
  }
}

/**
 * Convert IndexedDB schema to PresetDomain type
 */
function toPresetDomain(schema: PresetDomainSchema): PresetDomain {
  return {
    id: schema.id!,
    name: schema.name,
    created_at: schema.created_at
  }
}

// Database Repository with IndexedDB
export const indexedDbRepository = {
  /**
   * Get all flashcards, ordered by creation date (newest first)
   */
  async getAll(): Promise<Flashcard[]> {
    await ensureInitialized()
    try {
      const cards = await db.flashcards
        .orderBy('created_at')
        .reverse()
        .toArray()
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
      const card = await db.flashcards.get(id)
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
    const now = new Date().toISOString()
    try {
      const id = await db.flashcards.add({
        sentence: data.sentence,
        word: data.word,
        translation: data.translation,
        definition: data.definition || '',
        domain: data.domain || '通用',
        mastery: 1,
        review_count: 0,
        next_review: now,
        created_at: now
      })
      const card = await db.flashcards.get(id)
      if (!card) throw new Error('Failed to create flashcard')
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
      const existing = await db.flashcards.get(id)
      if (!existing) return null

      const updateData: Partial<FlashcardSchema> = {}
      if (updates.sentence !== undefined) updateData.sentence = updates.sentence
      if (updates.word !== undefined) updateData.word = updates.word
      if (updates.translation !== undefined) updateData.translation = updates.translation
      if (updates.definition !== undefined) updateData.definition = updates.definition
      if (updates.domain !== undefined) updateData.domain = updates.domain
      if (updates.mastery !== undefined) updateData.mastery = updates.mastery
      if (updates.review_count !== undefined) updateData.review_count = updates.review_count
      if (updates.next_review !== undefined) updateData.next_review = updates.next_review

      await db.flashcards.update(id, updateData)
      const card = await db.flashcards.get(id)
      return card ? toFlashcard(card) : null
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
      await db.flashcards.delete(id)
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
      await db.flashcards.clear()
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

      // Get cards that are due for review
      const dueCards = await db.flashcards
        .where('next_review')
        .belowOrEqual(now)
        .toArray()

      if (dueCards.length > 0) {
        // Apply weighted selection: lower mastery = higher weight
        const weightedCards: Array<{ card: FlashcardSchema; weight: number }> = dueCards.map(card => ({
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
        return weightedCards
          .slice(0, Math.min(limit, weightedCards.length))
          .map(w => toFlashcard(w.card))
      }

      // No cards due, return cards with lowest mastery
      const fallbackCards = await db.flashcards
        .orderBy('mastery')
        .limit(limit)
        .toArray()

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
      const allCards = await db.flashcards.toArray()

      const totalCards = allCards.length
      const masteredCards = allCards.filter(c => c.mastery === 3).length
      const masteryRate = totalCards > 0 ? (masteredCards / totalCards) * 100 : 0

      // Get domain distribution
      const domainDistribution: Record<string, number> = {}
      allCards.forEach(card => {
        const domain = card.domain || '未分类'
        domainDistribution[domain] = (domainDistribution[domain] || 0) + 1
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
  },

  /**
   * Get all preset domains
   */
  async getAllPresetDomains(): Promise<PresetDomain[]> {
    await ensureInitialized()
    try {
      const domains = await db.presetDomains
        .orderBy('created_at')
        .toArray()
      return domains.map(toPresetDomain)
    } catch (error) {
      console.error('Failed to get preset domains:', error)
      return []
    }
  },

  /**
   * Create new preset domain
   */
  async createPresetDomain(name: string): Promise<PresetDomain> {
    await ensureInitialized()
    const now = new Date().toISOString()
    const id = await db.presetDomains.add({ name, created_at: now })
    const domain = await db.presetDomains.get(id)
    if (!domain) throw new Error('Failed to create preset domain')
    return toPresetDomain(domain)
  },

  /**
   * Update preset domain
   */
  async updatePresetDomain(id: number, name: string): Promise<PresetDomain | null> {
    await ensureInitialized()
    try {
      await db.presetDomains.update(id, { name })
      const domain = await db.presetDomains.get(id)
      return domain ? toPresetDomain(domain) : null
    } catch {
      return null
    }
  },

  /**
   * Delete preset domain and set related flashcards' domain to '通用'
   */
  async deletePresetDomain(id: number, name: string): Promise<boolean> {
    await ensureInitialized()
    try {
      // Update related flashcards to use '通用' domain
      await db.flashcards
        .where('domain')
        .equals(name)
        .modify({ domain: '通用' })

      await db.presetDomains.delete(id)
      return true
    } catch {
      return false
    }
  },

  /**
   * Export all data from IndexedDB (for backup/migration)
   */
  async exportAllData(): Promise<{ flashcards: Flashcard[]; presetDomains: PresetDomain[] }> {
    const [flashcards, presetDomains] = await Promise.all([
      db.flashcards.toArray(),
      db.presetDomains.toArray()
    ])

    return {
      flashcards: flashcards.map(toFlashcard),
      presetDomains: presetDomains.map(toPresetDomain)
    }
  },

  /**
   * Import data to IndexedDB (for backup/migration)
   */
  async importData(
    data: { flashcards: Flashcard[]; presetDomains: PresetDomain[] },
    mode: 'overwrite' | 'append'
  ): Promise<{ flashcards: number; presetDomains: number }> {
    if (mode === 'overwrite') {
      await db.flashcards.clear()
      await db.presetDomains.clear()
    }

    // Import preset domains first
    let domainsImported = 0
    for (const domain of data.presetDomains) {
      try {
        await db.presetDomains.add({
          name: domain.name,
          created_at: domain.created_at
        })
        domainsImported++
      } catch {
        // Skip duplicates in append mode
      }
    }

    // Import flashcards
    let cardsImported = 0
    for (const card of data.flashcards) {
      try {
        await db.flashcards.add({
          sentence: card.sentence,
          word: card.word,
          translation: card.translation,
          definition: card.definition,
          domain: card.domain,
          mastery: card.mastery,
          review_count: card.review_count,
          next_review: card.next_review,
          created_at: card.created_at
        })
        cardsImported++
      } catch {
        // Skip duplicates in append mode
      }
    }

    return { flashcards: cardsImported, presetDomains: domainsImported }
  }
}
