import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/storage'
import { CreateFlashcardDTO } from '@/lib/types'

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

    const newCard = await storage.create(body)

    return NextResponse.json(newCard, { status: 201 })
  } catch (error) {
    console.error('Error creating flashcard:', error)
    return NextResponse.json(
      { error: 'Failed to create flashcard' },
      { status: 500 }
    )
  }
}
