// Flashcard data model
export interface Flashcard {
  id: number
  sentence: string
  word: string
  translation: string
  definition: string
  domain: string
  mastery: 1 | 2 | 3
  review_count: number
  next_review: string
  created_at: string
}

// Preset domain model
export interface PresetDomain {
  id: number
  name: string
  created_at: string
}

// Create flashcard input
export interface CreateFlashcardDTO {
  sentence: string
  word: string
  translation: string
  definition?: string
  domain?: string
}

// Update flashcard input (all fields optional)
export interface UpdateFlashcardDTO {
  sentence?: string
  word?: string
  translation?: string
  definition?: string
  domain?: string
}

// Review result input
export interface ReviewResultDTO {
  mastery: 1 | 2 | 3
}

// Statistics overview
export interface StatsOverview {
  total_cards: number
  mastered_cards: number
  mastery_rate: number
  domain_distribution: Record<string, number>
}

// API response types
export interface ReviewResponse {
  message: string
  updated_card: Flashcard
}

// Create preset domain input
export interface CreatePresetDomainDTO {
  name: string
}

// Update preset domain input
export interface UpdatePresetDomainDTO {
  name: string
}
