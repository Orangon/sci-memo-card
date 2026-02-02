'use client'

import { apiClient } from './api'
import { clientData } from './client-data'

export interface MigrationData {
  flashcards: any[]
  presetDomains: any[]
}

export interface MigrationResult {
  success: boolean
  message: string
  flashcardsImported: number
  domainsImported: number
  errors?: string[]
}

/**
 * Export data from PostgreSQL API
 * Call this before switching to IndexedDB to backup existing data
 */
export async function exportFromPostgreSQL(): Promise<MigrationData> {
  try {
    const [flashcards, presetDomains] = await Promise.all([
      apiClient.getAllCards(),
      apiClient.getAllPresetDomains()
    ])

    return {
      flashcards,
      presetDomains
    }
  } catch (error) {
    console.error('Failed to export from PostgreSQL:', error)
    throw new Error(
      `Failed to export from PostgreSQL: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Migrate data from PostgreSQL to IndexedDB
 * Exports from API and imports to IndexedDB
 */
export async function migrateToIndexedDB(): Promise<MigrationResult> {
  const errors: string[] = []
  let flashcardsImported = 0
  let domainsImported = 0

  try {
    // Step 1: Export from PostgreSQL
    console.log('Step 1: Exporting data from PostgreSQL...')
    const data = await exportFromPostgreSQL()
    console.log(`  - Found ${data.flashcards.length} flashcards`)
    console.log(`  - Found ${data.presetDomains.length} preset domains`)

    // Step 2: Prepare data for IndexedDB
    console.log('Step 2: Preparing data for import...')
    const jsonString = JSON.stringify(data, null, 2)

    // Step 3: Import to IndexedDB (overwrite mode)
    console.log('Step 3: Importing data to IndexedDB...')
    const result = await clientData.importData(jsonString, 'overwrite')

    flashcardsImported = result.imported
    domainsImported = result.total - result.imported

    if (result.errors && result.errors.length > 0) {
      result.errors.forEach(e => errors.push(e.error))
    }

    console.log(`  - Imported ${flashcardsImported} flashcards`)
    console.log(`  - Imported ${domainsImported} preset domains`)

    return {
      success: errors.length === 0,
      message: errors.length === 0
        ? 'Migration completed successfully!'
        : `Migration completed with ${errors.length} error(s)`,
      flashcardsImported,
      domainsImported,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (error) {
    console.error('Migration failed:', error)
    return {
      success: false,
      message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      flashcardsImported,
      domainsImported,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

/**
 * Check if PostgreSQL API is available
 */
export async function isPostgreSQLAvailable(): Promise<boolean> {
  try {
    await apiClient.getAllCards()
    return true
  } catch {
    return false
  }
}

/**
 * Download PostgreSQL data as JSON file (for manual backup before migration)
 */
export async function downloadPostgreSQLBackup(): Promise<void> {
  try {
    const data = await exportFromPostgreSQL()
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    link.download = `scimemocard-postgresql-backup-${timestamp}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to download PostgreSQL backup:', error)
    throw new Error('Failed to download PostgreSQL backup')
  }
}
