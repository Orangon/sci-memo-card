import { NextRequest, NextResponse } from 'next/server'
import { dbRepository } from '@/lib/db-repository'
import { Flashcard, CreateFlashcardDTO } from '@/lib/types'

// POST /api/cards/import - Import flashcards from JSON
export async function POST(request: NextRequest) {
  try {
    const mode = request.nextUrl.searchParams.get('mode') || 'append'
    const body = await request.json()

    // Validate input
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Invalid input: expected an array of flashcards' },
        { status: 400 }
      )
    }

    // Validate mode
    if (mode !== 'overwrite' && mode !== 'append') {
      return NextResponse.json(
        { error: 'Invalid mode: must be "overwrite" or "append"' },
        { status: 400 }
      )
    }

    // Clear existing data if overwrite mode
    if (mode === 'overwrite') {
      await dbRepository.clear()
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

      // Create card using db-repository
      const cardData: CreateFlashcardDTO = {
        sentence: card.sentence,
        word: card.word,
        translation: card.translation,
        definition: card.definition || '',
        domain: card.domain || '通用'
      }

      try {
        const newCard = await dbRepository.create(cardData)
        importedCards.push(newCard)
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const modeText = mode === 'overwrite' ? '覆盖' : '追加'
    return NextResponse.json({
      message: `${modeText}导入完成：成功导入 ${importedCards.length} 张闪卡`,
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
