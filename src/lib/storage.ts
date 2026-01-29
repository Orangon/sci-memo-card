import { Flashcard, CreateFlashcardDTO } from './types'
import fs from 'fs/promises'
import path from 'path'

// Data file path - store in project root for easy access
const DATA_FILE_PATH = path.join(process.cwd(), 'flashcards-data.json')

// In-memory cache
let flashcardsCache: Flashcard[] | null = null

// Initial sample data
const INITIAL_DATA: Flashcard[] = [
  {
    id: 1,
    sentence: 'The hypothesis was corroborated by empirical evidence from multiple experiments.',
    word: 'corroborated',
    translation: '证实，确证',
    definition: 'To confirm or give support to a statement, theory, or finding.',
    domain: '通用',
    mastery: 1,
    review_count: 0,
    next_review: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    sentence: 'The researchers identified a statistically significant correlation between the variables.',
    word: 'correlation',
    translation: '相关性',
    definition: 'A mutual relationship or connection between two or more things.',
    domain: '统计学',
    mastery: 2,
    review_count: 3,
    next_review: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    sentence: 'The methodology section describes the experimental design in detail.',
    word: 'methodology',
    translation: '方法论',
    definition: 'A system of methods used in a particular area of study or activity.',
    domain: '科研方法',
    mastery: 1,
    review_count: 1,
    next_review: new Date().toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
]

// Read flashcards from file (with cache)
async function readFlashcards(): Promise<Flashcard[]> {
  if (flashcardsCache !== null) {
    return flashcardsCache
  }

  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8')
    flashcardsCache = JSON.parse(data)
    return flashcardsCache
  } catch (error) {
    // File doesn't exist or is invalid, create initial data
    await writeFlashcards(INITIAL_DATA)
    flashcardsCache = INITIAL_DATA
    return flashcardsCache
  }
}

// Write flashcards to file
async function writeFlashcards(cards: Flashcard[]): Promise<void> {
  flashcardsCache = cards
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(cards, null, 2), 'utf-8')
}

// Storage API
export const storage = {
  // Get all flashcards
  async getAll(): Promise<Flashcard[]> {
    return await readFlashcards()
  },

  // Get flashcard by ID
  async getById(id: number): Promise<Flashcard | null> {
    const cards = await readFlashcards()
    return cards.find(card => card.id === id) || null
  },

  // Create new flashcard
  async create(data: CreateFlashcardDTO): Promise<Flashcard> {
    const cards = await readFlashcards()
    const newId = cards.length > 0 ? Math.max(...cards.map(c => c.id)) + 1 : 1
    const now = new Date().toISOString()

    const newCard: Flashcard = {
      id: newId,
      sentence: data.sentence,
      word: data.word,
      translation: data.translation,
      definition: data.definition || '',
      domain: data.domain || '通用',
      mastery: 1,
      review_count: 0,
      next_review: now,
      created_at: now
    }

    cards.push(newCard)
    await writeFlashcards(cards)
    return newCard
  },

  // Update flashcard
  async update(id: number, updates: Partial<Flashcard>): Promise<Flashcard | null> {
    const cards = await readFlashcards()
    const index = cards.findIndex(card => card.id === id)

    if (index === -1) {
      return null
    }

    cards[index] = { ...cards[index], ...updates }
    await writeFlashcards(cards)
    return cards[index]
  },

  // Delete flashcard
  async delete(id: number): Promise<boolean> {
    const cards = await readFlashcards()
    const filteredCards = cards.filter(card => card.id !== id)

    if (filteredCards.length === cards.length) {
      return false
    }

    await writeFlashcards(filteredCards)
    return true
  },

  // Get daily random cards (weighted by mastery level)
  async getDailyRandom(limit: number = 10): Promise<Flashcard[]> {
    const cards = await readFlashcards()
    const now = new Date().toISOString()

    // Filter cards that are due for review
    const dueCards = cards.filter(card => card.next_review <= now)

    if (dueCards.length === 0) {
      // No cards due, return cards with lowest mastery
      const sortedByMastery = [...cards].sort((a, b) => a.mastery - b.mastery)
      return sortedByMastery.slice(0, Math.min(limit, sortedByMastery.length))
    }

    // Weighted random selection: lower mastery = higher probability
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
  },

  // Get statistics
  async getStats() {
    const cards = await readFlashcards()

    const totalCards = cards.length
    const masteredCards = cards.filter(card => card.mastery === 3).length
    const masteryRate = totalCards > 0 ? (masteredCards / totalCards) * 100 : 0

    // Domain distribution
    const domainDistribution: Record<string, number> = {}
    cards.forEach(card => {
      domainDistribution[card.domain] = (domainDistribution[card.domain] || 0) + 1
    })

    return {
      total_cards: totalCards,
      mastered_cards: masteredCards,
      mastery_rate: Math.round(masteryRate * 10) / 10,
      domain_distribution: domainDistribution
    }
  }
}
