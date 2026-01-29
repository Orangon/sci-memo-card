import { sql } from '@vercel/postgres'
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
      const existingResult = await sql`
        SELECT id FROM flashcards WHERE id = ${card.id}
      `

      if (existingResult.rows.length === 0) {
        // Insert new card
        await sql`
          INSERT INTO flashcards (id, sentence, word, translation, definition, domain, mastery, review_count, next_review, created_at)
          VALUES (${card.id}, ${card.sentence}, ${card.word}, ${card.translation}, ${card.definition || ''}, ${card.domain || '通用'}, ${card.mastery}, ${card.review_count}, ${card.next_review}, ${card.created_at})
        `
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
    const result = await sql`
      SELECT id, sentence, word, translation, definition, domain, mastery, review_count, next_review, created_at
      FROM flashcards
      ORDER BY created_at DESC
    `

    const flashcards: Flashcard[] = result.rows.map(row => ({
      id: row.id,
      sentence: row.sentence,
      word: row.word,
      translation: row.translation,
      definition: row.definition,
      domain: row.domain,
      mastery: row.mastery,
      review_count: row.review_count,
      next_review: row.next_review,
      created_at: row.created_at
    }))

    return flashcards
  } catch (error) {
    console.error('Export failed:', error)
    throw error
  }
}
