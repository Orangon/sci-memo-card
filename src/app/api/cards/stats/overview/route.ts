import { NextRequest, NextResponse } from 'next/server'
import { dbRepository } from '@/lib/db-repository'

// GET /api/cards/stats/overview - Get learning statistics
export async function GET(_request: NextRequest) {
  try {
    const stats = await dbRepository.getStats()

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
