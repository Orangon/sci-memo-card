'use client'

import { clientData } from './client-data'

/**
 * Download data as a JSON file
 */
export async function downloadBackup(): Promise<void> {
  try {
    const jsonString = await clientData.exportData()
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    link.download = `scimemocard-backup-${timestamp}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to download backup:', error)
    throw new Error('Failed to download backup')
  }
}

/**
 * Restore data from a JSON file
 */
export async function restoreBackup(
  file: File,
  mode: 'overwrite' | 'append' = 'append'
): Promise<{
  message: string
  imported: number
  total: number
  errors?: Array<{ index: number; error: string }>
}> {
  try {
    const jsonString = await file.text()
    return await clientData.importData(jsonString, mode)
  } catch (error) {
    console.error('Failed to restore backup:', error)
    throw new Error('Failed to restore backup')
  }
}

/**
 * Validate backup file format
 */
export async function validateBackupFile(file: File): Promise<boolean> {
  try {
    const text = await file.text()
    const data = JSON.parse(text)

    // Check if data has expected structure
    return (
      typeof data === 'object' &&
      (Array.isArray(data.flashcards) || Array.isArray(data.presetDomains))
    )
  } catch {
    return false
  }
}
