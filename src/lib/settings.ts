// Settings storage using localStorage

const DEFAULT_DOMAIN_KEY = 'sci-memo-card-default-domain'

export interface AppSettings {
  defaultDomain: string
}

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  defaultDomain: ''
}

// Get all settings
export function getSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }

  try {
    const stored = localStorage.getItem(DEFAULT_DOMAIN_KEY)
    if (stored) {
      return { ...DEFAULT_SETTINGS, defaultDomain: stored }
    }
  } catch (error) {
    console.warn('Failed to read settings from localStorage:', error)
  }

  return DEFAULT_SETTINGS
}

// Save default domain
export function saveDefaultDomain(domain: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(DEFAULT_DOMAIN_KEY, domain)
  } catch (error) {
    console.warn('Failed to save default domain to localStorage:', error)
  }
}

// Get default domain
export function getDefaultDomain(): string {
  return getSettings().defaultDomain
}
