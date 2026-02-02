'use client'

import { indexedDbRepository } from './indexeddb-repository'
import {
  Flashcard,
  CreateFlashcardDTO,
  UpdateFlashcardDTO,
  ReviewResultDTO,
  ReviewResponse,
  StatsOverview,
  PresetDomain,
  CreatePresetDomainDTO,
  UpdatePresetDomainDTO,
} from './types'

/**
 * Spaced repetition intervals in milliseconds
 * - Level 1 (不熟 - Unfamiliar): 4 hours
 * - Level 2 (一般 - Familiar): 1 day
 * - Level 3 (熟练 - Mastered): 7 days
 */
const REVIEW_INTERVALS = {
  1: 4 * 60 * 60 * 1000,  // 4 hours
  2: 24 * 60 * 60 * 1000, // 1 day
  3: 7 * 24 * 60 * 60 * 1000 // 7 days
}

/**
 * Client data layer that replaces API calls with direct IndexedDB operations
 * Maintains the same interface as apiClient for easy migration
 */
class ClientData {
  /**
   * Get daily random cards for review
   */
  async getDailyRandomCards(limit: number = 10): Promise<Flashcard[]> {
    return indexedDbRepository.getDailyRandom(limit)
  }

  /**
   * Submit review result
   * Calculates next review date based on mastery level and updates the card
   */
  async submitReview(cardId: number, data: ReviewResultDTO): Promise<ReviewResponse> {
    const card = await indexedDbRepository.getById(cardId)
    if (!card) {
      throw new Error('Flashcard not found')
    }

    const now = new Date()
    const intervalMs = REVIEW_INTERVALS[data.mastery]
    const nextReviewDate = new Date(now.getTime() + intervalMs)

    const updatedCard = await indexedDbRepository.update(cardId, {
      mastery: data.mastery,
      review_count: card.review_count + 1,
      next_review: nextReviewDate.toISOString()
    })

    if (!updatedCard) {
      throw new Error('Failed to update flashcard')
    }

    return {
      message: 'Review submitted successfully',
      updated_card: updatedCard
    }
  }

  /**
   * Create new flashcard
   * Also creates preset domain if it doesn't exist
   */
  async createFlashcard(data: CreateFlashcardDTO): Promise<Flashcard> {
    const domain = data.domain || '通用'

    // Auto-create preset domain if it doesn't exist
    const domains = await indexedDbRepository.getAllPresetDomains()
    const domainExists = domains.some(d => d.name === domain)
    if (!domainExists) {
      await indexedDbRepository.createPresetDomain(domain)
    }

    return indexedDbRepository.create({ ...data, domain })
  }

  /**
   * Get statistics overview
   */
  async getStatistics(): Promise<StatsOverview> {
    return indexedDbRepository.getStats()
  }

  /**
   * Export all data as JSON string (for backup)
   */
  async exportData(): Promise<string> {
    const data = await indexedDbRepository.exportAllData()
    return JSON.stringify(data, null, 2)
  }

  /**
   * Import data from JSON string
   */
  async importData(
    jsonString: string,
    mode: 'overwrite' | 'append' = 'append'
  ): Promise<{
    message: string
    imported: number
    total: number
    errors?: Array<{ index: number; error: string }>
  }> {
    try {
      const data = JSON.parse(jsonString)
      const result = await indexedDbRepository.importData(data, mode)

      // Auto-create preset domains from imported flashcards
      if (data.flashcards) {
        const existingDomains = await indexedDbRepository.getAllPresetDomains()
        const existingDomainNames = new Set(existingDomains.map(d => d.name))

        for (const card of data.flashcards) {
          if (card.domain && !existingDomainNames.has(card.domain)) {
            try {
              await indexedDbRepository.createPresetDomain(card.domain)
              existingDomainNames.add(card.domain)
            } catch {
              // Domain might already exist
            }
          }
        }
      }

      return {
        message: `Successfully imported ${result.flashcards} flashcards and ${result.presetDomains} preset domains`,
        imported: result.flashcards + result.presetDomains,
        total: (data.flashcards?.length || 0) + (data.presetDomains?.length || 0)
      }
    } catch (error) {
      return {
        message: `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        imported: 0,
        total: 0,
        errors: [{ index: 0, error: error instanceof Error ? error.message : 'Unknown error' }]
      }
    }
  }

  /**
   * Get all flashcards
   */
  async getAllCards(): Promise<Flashcard[]> {
    return indexedDbRepository.getAll()
  }

  /**
   * Update flashcard
   * Also handles preset domain auto-creation
   */
  async updateCard(id: number, data: UpdateFlashcardDTO): Promise<Flashcard> {
    // Handle preset domain if domain is being updated
    if (data.domain) {
      const domains = await indexedDbRepository.getAllPresetDomains()
      const domainExists = domains.some(d => d.name === data.domain)
      if (!domainExists) {
        await indexedDbRepository.createPresetDomain(data.domain)
      }
    }

    const updated = await indexedDbRepository.update(id, data)
    if (!updated) {
      throw new Error('Flashcard not found')
    }
    return updated
  }

  /**
   * Delete flashcard
   */
  async deleteCard(id: number): Promise<void> {
    const success = await indexedDbRepository.delete(id)
    if (!success) {
      throw new Error('Flashcard not found')
    }
  }

  /**
   * Clear all flashcards
   */
  async clearAllCards(): Promise<void> {
    await indexedDbRepository.clear()
  }

  /**
   * Get all preset domains
   */
  async getAllPresetDomains(): Promise<PresetDomain[]> {
    return indexedDbRepository.getAllPresetDomains()
  }

  /**
   * Create new preset domain
   */
  async createPresetDomain(data: CreatePresetDomainDTO): Promise<PresetDomain> {
    return indexedDbRepository.createPresetDomain(data.name)
  }

  /**
   * Update preset domain
   */
  async updatePresetDomain(id: number, data: UpdatePresetDomainDTO): Promise<PresetDomain> {
    const updated = await indexedDbRepository.updatePresetDomain(id, data.name)
    if (!updated) {
      throw new Error('Preset domain not found')
    }
    return updated
  }

  /**
   * Delete preset domain
   */
  async deletePresetDomain(id: number): Promise<void> {
    const domains = await indexedDbRepository.getAllPresetDomains()
    const domain = domains.find(d => d.id === id)
    if (!domain) {
      throw new Error('Preset domain not found')
    }

    const success = await indexedDbRepository.deletePresetDomain(id, domain.name)
    if (!success) {
      throw new Error('Failed to delete preset domain')
    }
  }

  /**
   * Get flashcard by ID
   */
  async getCardById(id: number): Promise<Flashcard | null> {
    return indexedDbRepository.getById(id)
  }
}

// Export singleton instance
export const clientData = new ClientData()
