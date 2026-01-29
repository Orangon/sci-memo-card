import { Navigation } from '@/components/navigation'
import { StatsDisplay } from '@/components/flashcard/StatsDisplay'

export default function StatsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Navigation />
      <div className="mt-8">
        <StatsDisplay />
      </div>
    </div>
  )
}
