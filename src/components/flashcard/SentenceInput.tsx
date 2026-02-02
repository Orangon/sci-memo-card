'use client'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { WordSelector } from './WordSelector'
import { splitSentence } from '@/lib/word-splitter'
import { Loader2, Wand2 } from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SentenceInputProps {
  /** Current sentence value */
  value: string
  /** Callback when sentence changes */
  onChange: (value: string) => void
  /** Callback when a word is selected from the word list */
  onWordSelect: (word: string) => void
  /** Callback to clear word selection */
  onClearSelection: () => void
  /** Currently selected word */
  selectedWord?: string
  /** Error message to display */
  error?: string
  /** Optional className for styling */
  className?: string
  /** ID for the textarea */
  id?: string
  /** Placeholder text */
  placeholder?: string
}

/**
 * SentenceInput component
 *
 * Enhanced sentence input with one-click word split functionality.
 * Users can input a literature sentence and click the split button
 * to extract clickable vocabulary words.
 */
export function SentenceInput({
  value,
  onChange,
  onWordSelect,
  onClearSelection,
  selectedWord,
  error,
  className,
  id = 'sentence',
  placeholder = '粘贴包含生词的科研文献句子...',
}: SentenceInputProps) {
  const [extractedWords, setExtractedWords] = useState<string[]>([])
  const [isSplitting, setIsSplitting] = useState(false)

  /**
   * Clear extracted words when sentence is cleared (form reset)
   */
  useEffect(() => {
    if (!value || value.trim().length === 0) {
      setExtractedWords([])
    }
  }, [value])

  /**
   * Handle split button click
   * Extracts words from the sentence and displays them as clickable chips
   */
  const handleSplit = useCallback(async () => {
    if (!value || value.trim().length === 0) {
      return
    }

    setIsSplitting(true)

    try {
      // Simulate a small delay for better UX (shows loading state)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Extract words using the word splitter
      const words = splitSentence(value, {
        filterStopwords: true,
        minLength: 2,
        maxLength: 30,
      })

      setExtractedWords(words)
    } catch (error) {
      console.error('Failed to split sentence:', error)
    } finally {
      setIsSplitting(false)
    }
  }, [value])

  /**
   * Handle sentence change
   * Clear extracted words when sentence changes significantly
   */
  const handleSentenceChange = useCallback(
    (newValue: string) => {
      onChange(newValue)

      // Clear extracted words if sentence becomes empty
      if (!newValue || newValue.trim().length === 0) {
        setExtractedWords([])
      }
    },
    [onChange]
  )

  const isSplitDisabled = !value || value.trim().length === 0 || isSplitting

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>文献句子</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSplit}
          disabled={isSplitDisabled}
          className="h-7 gap-1.5"
        >
          {isSplitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>拆分中...</span>
            </>
          ) : (
            <>
              <Wand2 className="h-3.5 w-3.5" />
              <span>拆分</span>
            </>
          )}
        </Button>
      </div>

      <Textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleSentenceChange(e.target.value)}
        className={cn(
          'min-h-[100px]',
          error && 'border-destructive focus-visible:ring-destructive'
        )}
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <WordSelector
        words={extractedWords}
        selectedWord={selectedWord}
        onWordSelect={onWordSelect}
        onClearSelection={onClearSelection}
      />
    </div>
  )
}
