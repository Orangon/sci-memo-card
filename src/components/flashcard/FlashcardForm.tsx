'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { CreateFlashcardDTO } from '@/lib/types'
import { getDefaultDomain } from '@/lib/settings'
import { flashcardSchema, type FlashcardFormData } from '@/lib/flashcard-schema'
import { withErrorHandler } from '@/lib/mutation-handler'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

export function FlashcardForm() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
  } = useForm<FlashcardFormData>({
    resolver: zodResolver(flashcardSchema),
    defaultValues: {
      sentence: '',
      word: '',
      translation: '',
      definition: '',
      domain: getDefaultDomain(),
    },
  })

  const createMutation = useMutation(
    withErrorHandler({
      mutationFn: (data: CreateFlashcardDTO) => apiClient.createFlashcard(data),
      onSuccess: (data) => {
        toast({
          title: '成功',
          description: `闪卡 "${data.word}" 已添加`,
        })
        reset()
        queryClient.invalidateQueries({ queryKey: ['daily-random-cards'] })
      },
    })
  )

  const onSubmit = async (data: FlashcardFormData) => {
    const isValid = await trigger()
    if (!isValid) {
      return
    }
    createMutation.mutate(data)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>添加生词</CardTitle>
        <CardDescription>从科研文献中提取生词并添加上下文</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 文献句子 */}
          <div className="space-y-2">
            <label htmlFor="sentence" className="text-sm font-medium">
              文献句子 *
            </label>
            <Textarea
              id="sentence"
              placeholder="粘贴包含生词的科研文献句子..."
              className={`min-h-[100px] ${errors.sentence ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              {...register('sentence')}
            />
            {errors.sentence && (
              <p className="text-sm text-destructive">{errors.sentence.message}</p>
            )}
          </div>

          {/* 生词 */}
          <div className="space-y-2">
            <label htmlFor="word" className="text-sm font-medium">
              生词 *
            </label>
            <Textarea
              id="word"
              placeholder="输入生词..."
              className={`min-h-[60px] ${errors.word ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              {...register('word')}
            />
            {errors.word && (
              <p className="text-sm text-destructive">{errors.word.message}</p>
            )}
          </div>

          {/* 中文翻译 */}
          <div className="space-y-2">
            <label htmlFor="translation" className="text-sm font-medium">
              中文翻译 *
            </label>
            <Textarea
              id="translation"
              placeholder="输入中文翻译..."
              className={`min-h-[60px] ${errors.translation ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              {...register('translation')}
            />
            {errors.translation && (
              <p className="text-sm text-destructive">{errors.translation.message}</p>
            )}
          </div>

          {/* 学术定义 */}
          <div className="space-y-2">
            <label htmlFor="definition" className="text-sm font-medium">
              学术定义
            </label>
            <Textarea
              id="definition"
              placeholder="输入学术定义和解释..."
              className={`min-h-[80px] ${errors.definition ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              {...register('definition')}
            />
            {errors.definition && (
              <p className="text-sm text-destructive">{errors.definition.message}</p>
            )}
          </div>

          {/* 学科领域 */}
          <div className="space-y-2">
            <label htmlFor="domain" className="text-sm font-medium">
              学科领域
            </label>
            <Textarea
              id="domain"
              placeholder="输入学科领域..."
              className={`min-h-[60px] ${errors.domain ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              {...register('domain')}
            />
            {errors.domain && (
              <p className="text-sm text-destructive">{errors.domain.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? '添加中...' : '添加闪卡'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
