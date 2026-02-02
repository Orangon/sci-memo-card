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
      // Try to extract error message from response body
      let errorMessage = `API Error: ${response.statusText}`
      try {
        const errorData = await response.json()
        if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.detail) {
          errorMessage = errorData.detail
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (typeof errorData === 'string') {
          errorMessage = errorData
        }
      } catch {
        // If response is not JSON, use status text
      }
      throw new Error(errorMessage)
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
      // Try to extract error message from response body
      let errorMessage = `API Error: ${response.statusText}`
      try {
        const errorData = await response.json()
        if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.detail) {
          errorMessage = errorData.detail
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (typeof errorData === 'string') {
          errorMessage = errorData
        }
      } catch {
        // If response is not JSON, use status text
      }
      throw new Error(errorMessage)
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

  // Get all flashcards
  async getAllCards(): Promise<Flashcard[]> {
    return this.request<Flashcard[]>('/cards/')
  }

  // Update flashcard
  async updateCard(id: number, data: UpdateFlashcardDTO): Promise<Flashcard> {
    return this.request<Flashcard>(`/cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Delete flashcard
  async deleteCard(id: number): Promise<void> {
    return this.request<void>(`/cards/${id}`, {
      method: 'DELETE',
    })
  }

  // Get all preset domains
  async getAllPresetDomains(): Promise<PresetDomain[]> {
    return this.request<PresetDomain[]>('/domains')
  }

  // Create new preset domain
  async createPresetDomain(data: CreatePresetDomainDTO): Promise<PresetDomain> {
    return this.request<PresetDomain>('/domains', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Update preset domain
  async updatePresetDomain(id: number, data: UpdatePresetDomainDTO): Promise<PresetDomain> {
    return this.request<PresetDomain>(`/domains/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Delete preset domain
  async deletePresetDomain(id: number): Promise<void> {
    return this.request<void>(`/domains/${id}`, {
      method: 'DELETE',
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)
