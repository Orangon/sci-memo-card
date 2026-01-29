'use client'

import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Navigation />
      <div className="mt-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>设置</CardTitle>
            <CardDescription>个性化你的学习体验</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>复习间隔设置</Label>
                <div className="text-sm text-gray-500 mt-1">
                  基于遗忘曲线自动调整复习频率
                </div>
              </div>

              <div>
                <Label>数据导出</Label>
                <Button variant="outline" className="w-full mt-2">
                  导出学习数据 (JSON)
                </Button>
              </div>

              <div>
                <Label>默认学科领域</Label>
                <Input placeholder="例如: 计算机科学, 生物学..." />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
