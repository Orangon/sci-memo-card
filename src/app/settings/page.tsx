'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api'
import { getDefaultDomain, saveDefaultDomain } from '@/lib/settings'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import type { PresetDomain } from '@/lib/types'

type ImportMode = 'overwrite' | 'append'

export default function SettingsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [defaultDomain, setDefaultDomain] = useState('')
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [selectedImportMode, setSelectedImportMode] = useState<ImportMode | null>(null)

  // Domain management state
  const [editDialog, setEditDialog] = useState({
    isOpen: false,
    domain: null as PresetDomain | null,
    mode: 'create' as 'create' | 'edit'
  })
  const [domainName, setDomainName] = useState('')

  // Load default domain on mount
  useEffect(() => {
    const savedDomain = getDefaultDomain()
    setDefaultDomain(savedDomain)
  }, [])

  // Fetch preset domains
  const { data: presetDomains = [] } = useQuery({
    queryKey: ['preset-domains'],
    queryFn: () => apiClient.getAllPresetDomains(),
  })

  // Domain mutations
  const createMutation = useMutation({
    mutationFn: (name: string) => apiClient.createPresetDomain({ name }),
    onSuccess: () => {
      toast({
        title: '创建成功',
        description: '学科领域已添加',
      })
      setEditDialog({ isOpen: false, domain: null, mode: 'create' })
      setDomainName('')
      queryClient.invalidateQueries({ queryKey: ['preset-domains'] })
    },
    onError: (error: any) => {
      toast({
        title: '创建失败',
        description: error.message || '创建学科领域时出现错误',
        variant: 'destructive',
      })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      apiClient.updatePresetDomain(id, { name }),
    onSuccess: () => {
      toast({
        title: '更新成功',
        description: '学科领域已更新',
      })
      setEditDialog({ isOpen: false, domain: null, mode: 'create' })
      setDomainName('')
      queryClient.invalidateQueries({ queryKey: ['preset-domains'] })
    },
    onError: (error: any) => {
      toast({
        title: '更新失败',
        description: error.message || '更新学科领域时出现错误',
        variant: 'destructive',
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deletePresetDomain(id),
    onSuccess: () => {
      toast({
        title: '删除成功',
        description: '学科领域已删除',
      })
      queryClient.invalidateQueries({ queryKey: ['preset-domains'] })
    },
    onError: (error: any) => {
      toast({
        title: '删除失败',
        description: error.message || '删除学科领域时出现错误',
        variant: 'destructive',
      })
    }
  })

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

  // Handle import functionality - first show confirmation dialog
  const handleImportClick = () => {
    if (!importFile) {
      toast({
        title: '未选择文件',
        description: '请先选择要导入的 JSON 文件',
        variant: 'destructive',
      })
      return
    }
    setShowImportDialog(true)
  }

  // Handle import functionality - execute import
  const handleImport = async () => {
    if (!selectedImportMode) {
      toast({
        title: '未选择导入方式',
        description: '请选择一种导入方式',
        variant: 'destructive',
      })
      return
    }

    setShowImportDialog(false)

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

      // Import via API with mode
      const result = await apiClient.importData(cards, selectedImportMode)

      // Invalidate all queries to refresh data
      queryClient.invalidateQueries()

      toast({
        title: '导入完成',
        description: result.message || `成功导入 ${result.imported}/${result.total} 张闪卡`,
      })

      // Clear file input and selection
      setImportFile(null)
      setSelectedImportMode(null)
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
                    onClick={handleImportClick}
                    disabled={!importFile || isImporting}
                  >
                    {isImporting ? '导入中...' : '导入数据'}
                  </Button>
                </div>
              </div>

              {/* Default Domain */}
              <div>
                <Label>默认学科领域</Label>
                <div className="text-sm text-gray-500 mt-1 mb-2">
                  新建闪卡时将自动填充此学科领域
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="例如: 计算机科学, 生物学..."
                    value={defaultDomain}
                    onChange={(e) => setDefaultDomain(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      saveDefaultDomain(defaultDomain)
                      toast({
                        title: '保存成功',
                        description: '默认学科领域已更新',
                      })
                    }}
                    disabled={false}
                    variant="outline"
                  >
                    保存
                  </Button>
                </div>
              </div>

              {/* Domain Management */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label>学科领域管理</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDomainName('')
                      setEditDialog({ isOpen: true, domain: null, mode: 'create' })
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    添加新领域
                  </Button>
                </div>
                <p className="text-sm text-gray-500">管理预设的学科领域列表</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {presetDomains.map((domain) => (
                    <div key={domain.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">{domain.name}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setDomainName(domain.name)
                            setEditDialog({ isOpen: true, domain, mode: 'edit' })
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => {
                            if (confirm(`确定删除 "${domain.name}"? 相关闪卡的领域将被清空。`)) {
                              deleteMutation.mutate(domain.id)
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="space-y-4 pt-4 border-t">
                <Label className="text-red-600">危险操作</Label>
                <div className="border border-red-200 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mt-1">
                      ⚠️ 警告：此操作将永久删除所有闪卡数据，且无法恢复
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={async () => {
                      if (!confirm('确定要清空所有数据吗？此操作无法撤销！')) {
                        return
                      }
                      try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/cards/clear`, {
                          method: 'DELETE',
                        })
                        if (!response.ok) {
                          throw new Error('Failed to clear data')
                        }
                        queryClient.invalidateQueries()
                        toast({
                          title: '清空成功',
                          description: '所有数据已清空',
                        })
                      } catch (error) {
                        console.error('Clear error:', error)
                        toast({
                          title: '清空失败',
                          description: '清空数据时出现错误',
                          variant: 'destructive',
                        })
                      }
                    }}
                  >
                    清空所有数据
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Confirmation Dialog */}
      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>选择导入方式</AlertDialogTitle>
            <AlertDialogDescription>
              请选择如何处理导入的数据：
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-4">
            <button
              onClick={() => setSelectedImportMode('append')}
              className={`w-full justify-start text-left h-auto py-4 px-4 rounded-lg border-2 transition-colors ${
                selectedImportMode === 'append'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="space-y-1">
                <div className="font-medium">增加到已有数据中</div>
                <div className="text-sm text-gray-500">
                  将新闪卡添加到现有数据中，保留原有的所有闪卡
                </div>
              </div>
            </button>
            <button
              onClick={() => setSelectedImportMode('overwrite')}
              className={`w-full justify-start text-left h-auto py-4 px-4 rounded-lg border-2 transition-colors ${
                selectedImportMode === 'overwrite'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-orange-200 hover:border-orange-300 hover:bg-orange-50/50'
              }`}
            >
              <div className="space-y-1">
                <div className={`font-medium ${selectedImportMode === 'overwrite' ? 'text-orange-700' : ''}`}>
                  覆盖现有数据
                </div>
                <div className="text-sm text-gray-500">
                  ⚠️ 警告：这将删除所有现有闪卡，只保留导入的数据
                </div>
              </div>
            </button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedImportMode(null)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport} disabled={!selectedImportMode || isImporting}>
              {isImporting ? '导入中...' : '确认导入'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Domain Edit Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => setEditDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editDialog.mode === 'create' ? '添加新领域' : '编辑领域'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="例如: 计算机科学"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              maxLength={100}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ isOpen: false, domain: null, mode: 'create' })}
            >
              取消
            </Button>
            <Button
              onClick={() => {
                if (!domainName.trim()) {
                  toast({
                    title: '输入无效',
                    description: '请输入学科领域名称',
                    variant: 'destructive',
                  })
                  return
                }
                if (editDialog.mode === 'create') {
                  createMutation.mutate(domainName.trim())
                } else {
                  updateMutation.mutate({ id: editDialog.domain!.id, name: domainName.trim() })
                }
              }}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? (editDialog.mode === 'create' ? '创建中...' : '保存中...')
                : (editDialog.mode === 'create' ? '创建' : '保存')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
