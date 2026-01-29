import {
  Flashcard,
  CreateFlashcardDTO,
  ReviewResultDTO,
  ReviewResponse,
  StatsOverview,
} from './types'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'

// API client class
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  // Get daily random cards for review
  async getDailyRandomCards(limit: number = 10): Promise<Flashcard[]> {
    return this.request<Flashcard[]>(`/cards/daily-random?limit=${limit}`)
  }

  // Submit review result
  async submitReview(cardId: number, data: ReviewResultDTO): Promise<ReviewResponse> {
    return this.request<ReviewResponse>(`/cards/${cardId}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Create new flashcard
  async createFlashcard(data: CreateFlashcardDTO): Promise<Flashcard> {
    return this.request<Flashcard>('/cards/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Get statistics
  async getStatistics(): Promise<StatsOverview> {
    return this.request<StatsOverview>('/cards/stats/overview')
  }

  // Export data
  async exportData(): Promise<Blob> {
    const url = `${this.baseUrl}/cards/export/json`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.blob()
  }

  // Import data
  async importData(
    cards: any[],
    mode: 'overwrite' | 'append' = 'append'
  ): Promise<{
    message: string
    imported: number
    total: number
    errors?: Array<{ index: number; error: string }>
  }> {
    return this.request(`/cards/import?mode=${mode}`, {
      method: 'POST',
      body: JSON.stringify(cards),
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)
