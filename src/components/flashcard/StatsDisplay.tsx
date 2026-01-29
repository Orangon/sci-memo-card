'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function StatsDisplay() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['statistics'],
    queryFn: () => apiClient.getStatistics(),
  })

  if (isLoading) {
    return <div className="text-center py-12">加载中...</div>
  }

  // Use real stats or fallback to hardcoded values
  const displayStats = stats || {
    total_cards: 24,
    mastered_cards: 18,
    mastery_rate: 75,
    domain_distribution: {
      '量子物理': 8,
      '遗传学': 6,
      '人工智能': 4,
    },
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>学习统计</CardTitle>
        <CardDescription>跟踪你的学习进度和掌握情况</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{displayStats.total_cards}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">总生词量</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{displayStats.mastered_cards}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">已掌握</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="text-2xl font-bold text-yellow-600">{displayStats.mastery_rate}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">掌握率</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">学习进度</h3>
            <Progress value={displayStats.mastery_rate} className="w-full" />
          </div>

          <div>
            <h3 className="font-semibold mb-2">学科分布</h3>
            <div className="space-y-2">
              {Object.entries(displayStats.domain_distribution).map(([domain, count]) => (
                <div key={domain} className="flex justify-between">
                  <span>{domain}</span>
                  <span className="text-gray-600 dark:text-gray-400">{count}个</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
