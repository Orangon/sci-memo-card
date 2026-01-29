'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { CreateFlashcardDTO } from '@/lib/types'
import { getDefaultDomain } from '@/lib/settings'
import { flashcardSchema, type FlashcardFormData } from '@/lib/flashcard-schema'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

export function FlashcardForm() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const form = useForm<FlashcardFormData>({
    resolver: zodResolver(flashcardSchema),
    defaultValues: {
      sentence: '',
      word: '',
      translation: '',
      definition: '',
      domain: getDefaultDomain(),
    },
    mode: 'onBlur',
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateFlashcardDTO) => apiClient.createFlashcard(data),
    onSuccess: (data) => {
      toast({
        title: '成功',
        description: `闪卡 "${data.word}" 已添加`,
      })
      // Reset form
      form.reset()
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

  const onSubmit = (data: FlashcardFormData) => {
    createMutation.mutate(data)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>添加生词</CardTitle>
        <CardDescription>从科研文献中提取生词并添加上下文</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sentence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>文献句子 *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="粘贴包含生词的科研文献句子..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="word"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>生词 *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="输入生词..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="translation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>中文翻译 *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="输入中文翻译..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="definition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>学术定义</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="输入学术定义和解释..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>学科领域</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="输入学科领域..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? '添加中...' : '添加闪卡'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
