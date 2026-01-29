import { Suspense } from 'react'
import { Navigation } from '@/components/navigation'
import { FlashcardReview } from '@/components/flashcard/FlashcardReview'

export default function ReviewPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Navigation />
      <div className="mt-8">
        <Suspense fallback={<ReviewLoading />}>
          <FlashcardReview />
        </Suspense>
      </div>
    </div>
  )
}

function ReviewLoading() {
  return (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">正在加载复习卡片...</p>
    </div>
  )
}
