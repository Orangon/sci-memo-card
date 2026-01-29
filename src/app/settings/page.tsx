'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api'

export default function SettingsPage() {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)

  // Handle export functionality
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const blob = await apiClient.exportData()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `flashcards-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: '导出成功',
        description: '学习数据已成功导出为 JSON 文件',
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: '导出失败',
        description: '导出数据时出现错误，请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        toast({
          title: '文件格式错误',
          description: '请选择 JSON 格式的文件',
          variant: 'destructive',
        })
        return
      }
      setImportFile(file)
    }
  }

  // Handle import functionality
  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: '未选择文件',
        description: '请先选择要导入的 JSON 文件',
        variant: 'destructive',
      })
      return
    }

    setIsImporting(true)
    try {
      // Read file content
      const text = await importFile.text()
      const cards = JSON.parse(text)

      // Validate that it's an array
      if (!Array.isArray(cards)) {
        throw new Error('Invalid file format: expected an array of flashcards')
      }

      // Import via API
      const result = await apiClient.importData(cards)

      toast({
        title: '导入完成',
        description: result.message || `成功导入 ${result.imported}/${result.total} 张闪卡`,
      })

      // Clear file input
      setImportFile(null)
      const fileInput = document.getElementById('import-file') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }

      // Show errors if any
      if (result.errors && result.errors.length > 0) {
        console.warn('Import warnings:', result.errors)
        toast({
          title: '部分导入失败',
          description: `${result.errors.length} 张闪卡导入失败，请检查控制台查看详情`,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Import error:', error)
      toast({
        title: '导入失败',
        description: error instanceof Error ? error.message : '导入数据时出现错误，请检查文件格式',
        variant: 'destructive',
      })
    } finally {
      setIsImporting(false)
    }
  }

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
            <div className="space-y-6">
              {/* Review Settings */}
              <div>
                <Label>复习间隔设置</Label>
                <div className="text-sm text-gray-500 mt-1">
                  基于遗忘曲线自动调整复习频率
                </div>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div>• 不熟 (Level 1): 4 小时</div>
                  <div>• 一般 (Level 2): 1 天</div>
                  <div>• 熟练 (Level 3): 7 天</div>
                </div>
              </div>

              {/* Data Management */}
              <div className="space-y-4">
                <Label>数据管理</Label>

                {/* Export Section */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div>
                    <h3 className="font-medium">导出数据</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      将所有闪卡数据导出为 JSON 文件，用于备份或迁移
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleExport}
                    disabled={isExporting}
                  >
                    {isExporting ? '导出中...' : '导出学习数据 (JSON)'}
                  </Button>
                </div>

                {/* Import Section */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div>
                    <h3 className="font-medium">导入数据</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      从 JSON 文件导入闪卡数据，不会覆盖现有数据
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="import-file"
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileChange}
                      disabled={isImporting}
                    />
                    {importFile && (
                      <p className="text-sm text-gray-600">
                        已选择: {importFile.name}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleImport}
                    disabled={!importFile || isImporting}
                  >
                    {isImporting ? '导入中...' : '导入数据'}
                  </Button>
                </div>
              </div>

              {/* Default Domain */}
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
