import { sql } from '@vercel/postgres'

/**
 * Initialize the database schema
 * Creates the flashcards table and indexes if they don't exist
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Create flashcards table
    await sql`
      CREATE TABLE IF NOT EXISTS flashcards (
        id SERIAL PRIMARY KEY,
        sentence TEXT NOT NULL,
        word VARCHAR(255) NOT NULL,
        translation TEXT NOT NULL,
        definition TEXT DEFAULT '',
        domain VARCHAR(100) DEFAULT '通用',
        mastery INTEGER NOT NULL DEFAULT 1 CHECK (mastery IN (1, 2, 3)),
        review_count INTEGER NOT NULL DEFAULT 0,
        next_review TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `

    // Create indexes for better query performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_next_review ON flashcards(next_review);
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_domain ON flashcards(domain);
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_mastery ON flashcards(mastery);
    `

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

/**
 * Test database connectivity
 * Returns true if connection is successful, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT 1 as test`
    return result.rows.length > 0
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}

/**
 * Check if database has any data
 * Returns the count of flashcards in the database
 */
export async function getFlashcardCount(): Promise<number> {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM flashcards`
    return Number(result.rows[0]?.count || 0)
  } catch (error) {
    console.error('Failed to get flashcard count:', error)
    return 0
  }
}
