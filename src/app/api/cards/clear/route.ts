import { NextResponse } from 'next/server'
import { storage } from '@/lib/storage'

// DELETE /api/cards/clear - Clear all flashcards
export async function DELETE() {
  try {
    await storage.clear()

    return NextResponse.json({
      message: 'All flashcards cleared successfully'
    })
  } catch (error) {
    console.error('Error clearing flashcards:', error)
    return NextResponse.json(
      { error: 'Failed to clear flashcards' },
      { status: 500 }
    )
  }
}
