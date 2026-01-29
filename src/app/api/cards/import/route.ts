import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/storage'
import { Flashcard, CreateFlashcardDTO } from '@/lib/types'

// POST /api/cards/import - Import flashcards from JSON
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Invalid input: expected an array of flashcards' },
        { status: 400 }
      )
    }

    const importedCards: Flashcard[] = []
    const errors: Array<{ index: number; error: string }> = []

    // Process each card
    for (let i = 0; i < body.length; i++) {
      const card = body[i]

      // Validate required fields
      if (!card.sentence || !card.word || !card.translation) {
        errors.push({
          index: i,
          error: 'Missing required fields: sentence, word, or translation'
        })
        continue
      }

      // Create card using storage
      const cardData: CreateFlashcardDTO = {
        sentence: card.sentence,
        word: card.word,
        translation: card.translation,
        definition: card.definition || '',
        domain: card.domain || '通用'
      }

      try {
        const newCard = await storage.create(cardData)
        importedCards.push(newCard)
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: `Successfully imported ${importedCards.length} flashcards`,
      imported: importedCards.length,
      total: body.length,
      errors: errors.length > 0 ? errors : undefined
    }, { status: errors.length > 0 && importedCards.length === 0 ? 400 : 200 })

  } catch (error) {
    console.error('Error importing flashcards:', error)
    return NextResponse.json(
      { error: 'Failed to import flashcards' },
      { status: 500 }
    )
  }
}
