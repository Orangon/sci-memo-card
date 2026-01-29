import { Navigation } from '@/components/navigation'
import { FlashcardForm } from '@/components/flashcard/FlashcardForm'

export default function AddPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Navigation />
      <div className="mt-8">
        <FlashcardForm />
      </div>
    </div>
  )
}
