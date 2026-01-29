'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { CreateFlashcardDTO } from '@/lib/types'
import { getDefaultDomain } from '@/lib/settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

export function FlashcardForm() {
  // Initialize domain with default from settings
  const [sentence, setSentence] = useState('')
  const [word, setWord] = useState('')
  const [translation, setTranslation] = useState('')
  const [definition, setDefinition] = useState('')
  const [domain, setDomain] = useState(getDefaultDomain())
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const createMutation = useMutation({
    mutationFn: (data: CreateFlashcardDTO) => apiClient.createFlashcard(data),
    onSuccess: (data) => {
      toast({
        title: '成功',
        description: `闪卡 "${data.word}" 已添加`,
      })
      // Reset form
      setSentence('')
      setWord('')
      setTranslation('')
      setDefinition('')
      setDomain('')
      // Invalidate review cache
      queryClient.invalidateQueries({ queryKey: ['daily-random-cards'] })
    },
    onError: () => {
      toast({
        title: '错误',
        description: '添加闪卡失败',
        variant: 'destructive'
      })
    },
  })

  const handleSubmit = () => {
    if (!sentence || !word || !translation) {
      toast({
        title: '警告',
        description: '请填写完整的闪卡信息',
        variant: 'destructive'
      })
      return
    }

    createMutation.mutate({
      sentence,
      word,
      translation,
      definition,
      domain,
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>添加生词</CardTitle>
        <CardDescription>从科研文献中提取生词并添加上下文</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="sentence">文献句子</Label>
            <Textarea
              id="sentence"
              placeholder="粘贴包含生词的科研文献句子..."
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="word">生词</Label>
            <Input
              id="word"
              placeholder="输入生词..."
              value={word}
              onChange={(e) => setWord(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="translation">中文翻译</Label>
            <Input
              id="translation"
              placeholder="输入中文翻译..."
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="definition">学术定义</Label>
            <Textarea
              id="definition"
              placeholder="输入学术定义和解释..."
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="domain">学科领域</Label>
            <Input
              id="domain"
              placeholder="输入学科领域..."
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? '添加中...' : '添加闪卡'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
