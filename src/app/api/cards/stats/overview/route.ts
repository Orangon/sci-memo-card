import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/storage'

// GET /api/cards/stats/overview - Get learning statistics
export async function GET(request: NextRequest) {
  try {
    const stats = await storage.getStats()

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
