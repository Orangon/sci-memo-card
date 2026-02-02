import { NextRequest, NextResponse } from 'next/server'
import { dbRepository } from '@/lib/db-repository'

// GET /api/cards/[id] - Get single flashcard
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cardId = parseInt(id, 10)

    if (isNaN(cardId)) {
      return NextResponse.json(
        { error: 'Invalid card ID' },
        { status: 400 }
      )
    }

    const card = await dbRepository.getById(cardId)

    if (!card) {
      return NextResponse.json(
        { error: 'Flashcard not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error fetching flashcard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch flashcard' },
      { status: 500 }
    )
  }
}

// PUT /api/cards/[id] - Update flashcard
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cardId = parseInt(id, 10)

    if (isNaN(cardId)) {
      return NextResponse.json(
        { error: 'Invalid card ID' },
        { status: 400 }
      )
    }

    const updates = await request.json()

    // Auto-create preset domain if custom domain is provided and not empty
    if (updates.domain && updates.domain.trim()) {
      const trimmedDomain = updates.domain.trim()
      const existingDomains = await dbRepository.getAllPresetDomains()
      const domainExists = existingDomains.some(d => d.name === trimmedDomain)

      if (!domainExists) {
        try {
          await dbRepository.createPresetDomain(trimmedDomain)
        } catch (error) {
          // Ignore duplicate errors (race condition), log other errors
          console.error('Error auto-creating preset domain:', error)
        }
      }
    }

    const updatedCard = await dbRepository.update(cardId, updates)

    if (!updatedCard) {
      return NextResponse.json(
        { error: 'Flashcard not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedCard)
  } catch (error) {
    console.error('Error updating flashcard:', error)
    return NextResponse.json(
      { error: 'Failed to update flashcard' },
      { status: 500 }
    )
  }
}

// DELETE /api/cards/[id] - Delete flashcard
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cardId = parseInt(id, 10)

    if (isNaN(cardId)) {
      return NextResponse.json(
        { error: 'Invalid card ID' },
        { status: 400 }
      )
    }

    const success = await dbRepository.delete(cardId)

    if (!success) {
      return NextResponse.json(
        { error: 'Flashcard not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Flashcard deleted successfully',
      id: cardId
    })
  } catch (error) {
    console.error('Error deleting flashcard:', error)
    return NextResponse.json(
      { error: 'Failed to delete flashcard' },
      { status: 500 }
    )
  }
}
