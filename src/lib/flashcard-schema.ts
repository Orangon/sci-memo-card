// Flashcard form validation schema - simplified, only check required fields

import { z } from 'zod'

export const flashcardSchema = z.object({
  sentence: z.string().min(1, '文献句子不能为空').max(1000),
  word: z.string().min(1, '生词不能为空').max(100),
  translation: z.string().min(1, '中文翻译不能为空').max(200),
  definition: z.string().max(500).optional().or(z.literal('')),
  domain: z.string().max(50).optional().or(z.literal(''))
})

export type FlashcardFormData = z.infer<typeof flashcardSchema>

// Update schema - all fields optional
export const updateFlashcardSchema = z.object({
  sentence: z.string().min(1, '文献句子不能为空').max(1000).optional(),
  word: z.string().min(1, '生词不能为空').max(100).optional(),
  translation: z.string().min(1, '中文翻译不能为空').max(200).optional(),
  definition: z.string().max(500).optional().or(z.literal('')),
  domain: z.string().max(50).optional().or(z.literal(''))
})

export type UpdateFlashcardFormData = z.infer<typeof updateFlashcardSchema>
