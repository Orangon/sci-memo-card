'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { Flashcard } from '@/lib/types'
import { FlashcardDisplay } from './FlashcardDisplay'
import { ReviewButtons } from './ReviewButtons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function FlashcardReview() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch daily random cards
  const { data: cards = [], isLoading, error } = useQuery({
    queryKey: ['daily-random-cards'],
    queryFn: () => apiClient.getDailyRandomCards(10),
  })

  // Submit review mutation
  const reviewMutation = useMutation({
    mutationFn: ({ cardId, mastery }: { cardId: number; mastery: 1 | 2 | 3 }) =>
      apiClient.submitReview(cardId, { mastery }),
    onSuccess: (data) => {
      toast({
        title: '复习完成',
        description: data.message,
      })
      goToNextCard()
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['daily-random-cards'] })
    },
    onError: () => {
      toast({
        title: '错误',
        description: '提交复习结果失败',
        variant: 'destructive'
      })
    },
  })

  const currentCard = cards[currentIndex]

  const goToNextCard = () => {
    if (cards.length === 0) return
    const nextIndex = (currentIndex + 1) % cards.length
    setCurrentIndex(nextIndex)
  }

  const goToPrevCard = () => {
    if (cards.length === 0) return
    const prevIndex = (currentIndex - 1 + cards.length) % cards.length
    setCurrentIndex(prevIndex)
  }

  const handleReview = (mastery: 1 | 2 | 3) => {
    if (!currentCard) return
    reviewMutation.mutate({ cardId: currentCard.id, mastery })
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">加载失败，请检查后端服务</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['daily-random-cards'] })}>
              <RotateCcw className="w-4 h-4 mr-2" />
              重试
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentCard && !isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">暂无复习卡片</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['daily-random-cards'] })}>
              <RotateCcw className="w-4 h-4 mr-2" />
              重新加载
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>闪卡复习</CardTitle>
        <CardDescription>基于遗忘曲线的智能复习系统</CardDescription>
      </CardHeader>
      <CardContent>
        {currentCard && (
          <div className="space-y-6">
            <FlashcardDisplay
              card={currentCard}
              currentIndex={currentIndex}
              totalCards={cards.length}
              onNext={goToNextCard}
              onPrev={goToPrevCard}
            />
            <ReviewButtons onReview={handleReview} isLoading={reviewMutation.isPending} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
