'use client'

import { useState } from 'react'
import type { Flashcard } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, FlipHorizontal } from 'lucide-react'

interface FlashcardDisplayProps {
  card: Flashcard
  currentIndex: number
  totalCards: number
  onNext: () => void
  onPrev: () => void
}

export function FlashcardDisplay({
  card,
  currentIndex,
  totalCards,
  onNext,
  onPrev
}: FlashcardDisplayProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const isOverdue = card.next_review && new Date(card.next_review) <= new Date()

  return (
    <div className="space-y-6">
      {/* Card navigation and info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>卡片 {currentIndex + 1} / {totalCards}</span>
          <Badge variant={isOverdue ? "destructive" : "secondary"}>
            {isOverdue ? "待复习" : "未到期"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onPrev} disabled={currentIndex === 0}>
            上一张
          </Button>
          <Button variant="ghost" size="sm" onClick={onNext} disabled={currentIndex === totalCards - 1}>
            下一张
          </Button>
        </div>
      </div>

      {/* Sentence display area */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4 mr-1" />
            科研文献句子
          </div>
          <p className="text-xl text-gray-800 dark:text-gray-100 mb-6 leading-relaxed font-serif">
            {card.sentence.split(' ').map((word, index) =>
              word.toLowerCase() === card.word.toLowerCase() ? (
                <span
                  key={index}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-1 rounded-lg font-bold mx-1 shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  {word}
                </span>
              ) : (
                <span key={index} className="mx-1">{word}</span>
              )
            )}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            观察高亮显示的单词，尝试回忆其学术含义
          </p>
        </div>
      </div>

      {/* Explanation card area */}
      <div
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-[1.02] border-2 border-dashed border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {!isFlipped ? (
          <div className="text-center">
            <div className="flex flex-col items-center justify-center gap-3 text-blue-700 dark:text-blue-300">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <FlipHorizontal className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">点击查看单词解释</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">包含中文翻译和学术定义</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 border border-yellow-200 dark:border-yellow-700 rounded-xl px-6 py-4 mx-auto max-w-md shadow-sm">
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                {card.word}
              </p>
              <p className="text-lg text-orange-800 dark:text-orange-200 font-medium mb-3">{card.translation}</p>
              <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-tight">{card.definition}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1.5 text-sm">
              📚 {card.domain}
            </Badge>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              掌握程度: {['不熟', '一般', '熟练'][card.mastery - 1]} |
              复习次数: {card.review_count}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
