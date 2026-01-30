import { NextRequest, NextResponse } from 'next/server'
import { dbRepository } from '@/lib/db-repository'
import { CreateFlashcardDTO } from '@/lib/types'

// GET /api/cards/ - List all flashcards
export async function GET() {
  try {
    const cards = await dbRepository.getAll()
    return NextResponse.json(cards)
  } catch (error) {
    console.error('Error fetching flashcards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch flashcards' },
      { status: 500 }
    )
  }
}

// POST /api/cards/ - Create new flashcard
export async function POST(request: NextRequest) {
  try {
    const body: CreateFlashcardDTO = await request.json()

    // Validate required fields
    if (!body.sentence || !body.word || !body.translation) {
      return NextResponse.json(
        { error: 'Missing required fields: sentence, word, translation' },
        { status: 400 }
      )
    }

    const newCard = await dbRepository.create(body)

    return NextResponse.json(newCard, { status: 201 })
  } catch (error) {
    console.error('Error creating flashcard:', error)
    return NextResponse.json(
      { error: 'Failed to create flashcard' },
      { status: 500 }
    )
  }
}
