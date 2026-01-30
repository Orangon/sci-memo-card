import { prisma } from './prisma'
import { Flashcard } from './types'
import fs from 'fs/promises'
import path from 'path'

/**
 * Migrate flashcards from JSON file to Postgres database
 * Reads from flashcards-data.json and inserts all records into the database
 * @returns Number of flashcards migrated
 */
export async function migrateFromJsonFile(): Promise<number> {
  const DATA_FILE_PATH = path.join(process.cwd(), 'flashcards-data.json')

  try {
    // Check if JSON file exists
    const fileExists = await fs.access(DATA_FILE_PATH).then(() => true).catch(() => false)
    if (!fileExists) {
      console.log('No flashcards-data.json file found, skipping migration')
      return 0
    }

    // Read and parse JSON file
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8')
    const flashcards: Flashcard[] = JSON.parse(data)

    if (flashcards.length === 0) {
      console.log('JSON file is empty, skipping migration')
      return 0
    }

    console.log(`Found ${flashcards.length} flashcards in JSON file, starting migration...`)

    let migratedCount = 0

    for (const card of flashcards) {
      // Check if card already exists (by ID)
      const existing = await prisma.flashcard.findUnique({
        where: { id: card.id }
      })

      if (!existing) {
        // Insert new card
        await prisma.flashcard.create({
          data: {
            id: card.id,
            sentence: card.sentence,
            word: card.word,
            translation: card.translation,
            definition: card.definition,
            domain: card.domain,
            mastery: card.mastery,
            reviewCount: card.review_count,
            nextReview: new Date(card.next_review),
            createdAt: new Date(card.created_at)
          }
        })
        migratedCount++
      } else {
        console.log(`Card with id ${card.id} already exists, skipping`)
      }
    }

    console.log(`Migration completed: ${migratedCount} flashcards imported`)
    return migratedCount

  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

/**
 * Export database to JSON file
 * Useful for backup or rollback purposes
 */
export async function exportToJson(): Promise<Flashcard[]> {
  try {
    const flashcards = await prisma.flashcard.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return flashcards.map(card => ({
      id: card.id,
      sentence: card.sentence,
      word: card.word,
      translation: card.translation,
      definition: card.definition || '',
      domain: card.domain,
      mastery: card.mastery as 1 | 2 | 3,
      review_count: card.reviewCount,
      next_review: card.nextReview.toISOString(),
      created_at: card.createdAt.toISOString()
    }))
  } catch (error) {
    console.error('Export failed:', error)
    throw error
  }
}
