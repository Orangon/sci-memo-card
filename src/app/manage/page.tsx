import { Navigation } from '@/components/navigation'
import { CardManagement } from '@/components/flashcard/CardManagement'

export default function ManagePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Navigation />
      <div className="mt-8">
        <CardManagement />
      </div>
    </div>
  )
}
