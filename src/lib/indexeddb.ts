import Dexie, { Table } from 'dexie'

/**
 * IndexedDB schema for SciMemoCard
 * Replaces Prisma + PostgreSQL with browser-based storage
 */

export interface FlashcardSchema {
  id?: number
  sentence: string
  word: string
  translation: string
  definition: string | null
  domain: string
  mastery: 1 | 2 | 3
  review_count: number
  next_review: string
  created_at: string
}

export interface PresetDomainSchema {
  id?: number
  name: string
  created_at: string
}

export class SciMemoDatabase extends Dexie {
  flashcards!: Table<FlashcardSchema, number>
  presetDomains!: Table<PresetDomainSchema, number>

  constructor() {
    super('SciMemoCardDB')
    this.version(1).stores({
      flashcards: '++id, domain, mastery, next_review, created_at',
      presetDomains: '++id, name, created_at'
    })
  }
}

export const db = new SciMemoDatabase()
