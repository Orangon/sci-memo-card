'use client'

import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { Flashcard, UpdateFlashcardDTO } from '@/lib/types'
import { updateFlashcardSchema, type UpdateFlashcardFormData } from '@/lib/flashcard-schema'
import { withErrorHandler } from '@/lib/mutation-handler'
import { useToast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FlashcardFormFields } from '@/components/flashcard/FlashcardFormFields'

interface EditFlashcardDialogProps {
  card: Flashcard
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditFlashcardDialog({ card, open, onOpenChange }: EditFlashcardDialogProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
  } = useForm<UpdateFlashcardFormData>({
    resolver: zodResolver(updateFlashcardSchema),
    defaultValues: {
      sentence: card.sentence,
      word: card.word,
      translation: card.translation,
      definition: card.definition || '',
      domain: card.domain || '',
    },
  })

  // Reset form when card changes
  useEffect(() => {
    reset({
      sentence: card.sentence,
      word: card.word,
      translation: card.translation,
      definition: card.definition || '',
      domain: card.domain || '',
    })
  }, [card, reset])

  const updateMutation = useMutation(
    withErrorHandler({
      mutationFn: (data: UpdateFlashcardDTO) => apiClient.updateCard(card.id, data),
      onSuccess: (data) => {
        toast({
          title: '成功',
          description: `闪卡 "${data.word}" 已更新`,
        })
        queryClient.invalidateQueries({ queryKey: ['all-cards'] })
        queryClient.invalidateQueries({ queryKey: ['daily-random-cards'] })
        onOpenChange(false)
      },
    })
  )

  const onSubmit = async (data: UpdateFlashcardFormData) => {
    const isValid = await trigger()
    if (!isValid) {
      return
    }

    // Filter out empty optional fields
    const submitData: UpdateFlashcardDTO = {}
    if (data.sentence !== undefined) submitData.sentence = data.sentence
    if (data.word !== undefined) submitData.word = data.word
    if (data.translation !== undefined) submitData.translation = data.translation
    if (data.definition !== undefined && data.definition !== '') submitData.definition = data.definition
    if (data.domain !== undefined && data.domain !== '') submitData.domain = data.domain

    updateMutation.mutate(submitData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑闪卡</DialogTitle>
          <DialogDescription>修改闪卡的内容</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FlashcardFormFields register={register} errors={errors} />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              取消
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
