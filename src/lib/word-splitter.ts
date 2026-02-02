/**
 * Stopwords (common words to filter out)
 * Includes: articles, prepositions, pronouns, common verbs, conjunctions
 */
const STOPWORDS = new Set([
  // Articles
  'a', 'an', 'the',
  // Pronouns
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their',
  'this', 'that', 'these', 'those',
  'who', 'which', 'what', 'where', 'when', 'why', 'how',
  // Prepositions
  'in', 'on', 'at', 'by', 'for', 'with', 'from', 'to', 'of', 'as',
  'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'under', 'again', 'further', 'then', 'once',
  // Conjunctions
  'and', 'but', 'or', 'nor', 'so', 'yet',
  // Common verbs
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'can', 'could', 'should', 'may', 'might', 'must',
  // Common adverbs
  'not', 'no', 'yes', 'here', 'there', 'now', 'then', 'just',
  'also', 'very', 'well', 'too', 'only', 'even',
  // Other common words
  'all', 'any', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'only', 'own', 'same', 'than',
  'about', 'against', 'along', 'among', 'around', 'because',
])

/**
 * Default options for word splitting
 */
const DEFAULT_OPTIONS = {
  filterStopwords: true,
  minLength: 2,
  maxLength: 30,
}

/**
 * Split sentence into words with smart tokenization
 *
 * Handles:
 * - Hyphenated words (e.g., "state-of-the-art")
 * - Words with apostrophes (e.g., "researcher's")
 * - Scientific terms with numbers
 * - Parentheses and quotes
 *
 * @param sentence - The literature sentence to split
 * @param options - Configuration options
 * @returns Array of extracted words
 */
export function splitSentence(
  sentence: string,
  options: {
    filterStopwords?: boolean
    minLength?: number
    maxLength?: number
  } = {}
): string[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  if (!sentence || sentence.trim().length === 0) {
    return []
  }

  // Extract words using regex that handles:
  // - Regular words: \b[a-zA-Z]+\b
  // - Hyphenated words: \b[a-zA-Z]+(?:-[a-zA-Z]+)+\b
  // - Words with apostrophes: \b[a-zA-Z]+'[a-zA-Z]+\b
  // - Scientific terms with numbers: \b[a-zA-Z]+\d+\b
  const wordRegex = /\b[a-zA-Z]+(?:-[a-zA-Z]+)*'[a-zA-Z]+\b|\b[a-zA-Z]+(?:-[a-zA-Z]+)+\b|\b[a-zA-Z]+\d+\b|\b[a-zA-Z]{2,}\b/g

  const words: string[] = []
  let match: RegExpExecArray | null

  // Reset regex state
  wordRegex.lastIndex = 0

  while ((match = wordRegex.exec(sentence)) !== null) {
    const word = match[0]

    // Skip if too short or too long
    if (word.length < opts.minLength || word.length > opts.maxLength) {
      continue
    }

    // Skip if it's a stopword (when filtering is enabled)
    if (opts.filterStopwords && STOPWORDS.has(word.toLowerCase())) {
      continue
    }

    // Skip words that are only numbers or special characters
    if (/^\d+$/.test(word)) {
      continue
    }

    words.push(word)
  }

  // Remove duplicates while preserving order
  const uniqueWords = Array.from(new Set(words))

  return uniqueWords
}

/**
 * Normalize word for comparison
 * Handles case insensitivity and trailing punctuation
 */
export function normalizeWord(word: string): string {
  return word.toLowerCase().trim()
}

/**
 * Check if a word should be included in the word list
 */
export function shouldIncludeWord(
  word: string,
  options: typeof DEFAULT_OPTIONS = DEFAULT_OPTIONS
): boolean {
  if (word.length < options.minLength || word.length > options.maxLength) {
    return false
  }

  if (options.filterStopwords && STOPWORDS.has(word.toLowerCase())) {
    return false
  }

  return true
}
