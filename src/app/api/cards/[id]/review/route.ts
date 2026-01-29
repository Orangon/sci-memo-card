import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/storage'

interface ReviewRequestBody {
  mastery: 1 | 2 | 3
}

// Helper function to calculate next review time based on mastery
function calculateNextReview(mastery: 1 | 2 | 3): Date {
  const now = new Date()

  switch (mastery) {
    case 1: // Unfamiliar - review in 4 hours
      return new Date(now.getTime() + 4 * 60 * 60 * 1000)
    case 2: // Familiar - review in 1 day
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case 3: // Mastered - review in 7 days
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() + 4 * 60 * 60 * 1000)
  }
}

// POST /api/cards/[id]/review - Submit review result
export async function POST(
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

    const body: ReviewRequestBody = await request.json()

    // Validate mastery level
    if (!body.mastery || ![1, 2, 3].includes(body.mastery)) {
      return NextResponse.json(
        { error: 'Invalid mastery level. Must be 1, 2, or 3' },
        { status: 400 }
      )
    }

    // Get existing card
    const existingCard = await storage.getById(cardId)
    if (!existingCard) {
      return NextResponse.json(
        { error: 'Flashcard not found' },
        { status: 404 }
      )
    }

    // Update card with new review data
    const nextReview = calculateNextReview(body.mastery)
    const updatedCard = await storage.update(cardId, {
      mastery: body.mastery,
      review_count: existingCard.review_count + 1,
      next_review: nextReview.toISOString()
    })

    return NextResponse.json({
      message: 'Review submitted successfully',
      updated_card: updatedCard
    })
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}
