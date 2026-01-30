import { NextRequest, NextResponse } from 'next/server'
import { dbRepository } from '@/lib/db-repository'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    const cards = await dbRepository.getDailyRandom(limit)

    return NextResponse.json(cards)
  } catch (error) {
    console.error('Error fetching daily random cards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily random cards' },
      { status: 500 }
    )
  }
}
