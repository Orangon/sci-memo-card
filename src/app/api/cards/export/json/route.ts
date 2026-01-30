import { NextResponse } from 'next/server'
import { dbRepository } from '@/lib/db-repository'

// GET /api/cards/export/json - Export all flashcards as JSON
export async function GET() {
  try {
    const cards = await dbRepository.getAll()

    return NextResponse.json(cards, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="flashcards-export.json"'
      }
    })
  } catch (error) {
    console.error('Error exporting flashcards:', error)
    return NextResponse.json(
      { error: 'Failed to export flashcards' },
      { status: 500 }
    )
  }
}
