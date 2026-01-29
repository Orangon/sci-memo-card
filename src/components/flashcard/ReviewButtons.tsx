'use client'

import { Button } from '@/components/ui/button'

interface ReviewButtonsProps {
  onReview: (mastery: 1 | 2 | 3) => void
  isLoading: boolean
}

export function ReviewButtons({ onReview, isLoading }: ReviewButtonsProps) {
  return (
    <div className="flex gap-4 justify-center">
      <Button
        variant="outline"
        className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-100"
        onClick={() => onReview(1)}
        disabled={isLoading}
      >
        不熟
      </Button>
      <Button
        variant="outline"
        className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100"
        onClick={() => onReview(2)}
        disabled={isLoading}
      >
        一般
      </Button>
      <Button
        variant="outline"
        className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-100"
        onClick={() => onReview(3)}
        disabled={isLoading}
      >
        熟练
      </Button>
    </div>
  )
}
