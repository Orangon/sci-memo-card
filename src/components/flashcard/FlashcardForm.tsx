'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { CreateFlashcardDTO } from '@/lib/types'
import { getDefaultDomain } from '@/lib/settings'
import { flashcardSchema, type FlashcardFormData } from '@/lib/flashcard-schema'
import { withErrorHandler } from '@/lib/mutation-handler'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FlashcardFormFields } from '@/components/flashcard/FlashcardFormFields'
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
          <FlashcardFormFields register={register} errors={errors} />

          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? '添加中...' : '添加闪卡'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
