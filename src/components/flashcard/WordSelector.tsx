'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface WordSelectorProps {
  /** Array of extracted words to display */
  words: string[]
  /** Currently selected word */
  selectedWord?: string
  /** Callback when a word is clicked */
  onWordSelect: (word: string) => void
  /** Callback to clear selection */
  onClearSelection: () => void
  /** Optional className for styling */
  className?: string
}

/**
 * WordSelector component
 *
 * Displays extracted words as clickable chips in a scrollable, collapsible area.
 * Users can click a word chip to select it as the vocabulary word.
 */
export function WordSelector({
  words,
  selectedWord,
  onWordSelect,
  onClearSelection,
  className,
}: WordSelectorProps) {
  const [isOpen, setIsOpen] = useState(true)

  if (words.length === 0) {
    return null
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn('w-full space-y-2', className)}
    >
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 px-2 h-7 text-sm text-muted-foreground hover:text-foreground"
          >
            <span>选择词汇</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isOpen && 'transform rotate-180'
              )}
            />
          </Button>
        </CollapsibleTrigger>

        {selectedWord && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-7 px-2 text-sm text-muted-foreground hover:text-destructive"
          >
            <X className="h-3 w-3 mr-1" />
            清除选择
          </Button>
        )}
      </div>

      <CollapsibleContent className="space-y-2">
        <ScrollArea className="h-[120px] w-full rounded-md border">
          <div className="p-3">
            <div className="flex flex-wrap gap-2">
              {words.map((word) => {
                const isSelected = selectedWord === word
                return (
                  <Badge
                    key={word}
                    variant={isSelected ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-all hover:scale-105',
                      isSelected && 'ring-2 ring-ring ring-offset-2'
                    )}
                    onClick={() => onWordSelect(word)}
                    role="button"
                    tabIndex={0}
                  >
                    {word}
                  </Badge>
                )
              })}
            </div>
          </div>
        </ScrollArea>
        <p className="text-xs text-muted-foreground">
          点击选择词汇，或直接在下方输入
        </p>
      </CollapsibleContent>
    </Collapsible>
  )
}
