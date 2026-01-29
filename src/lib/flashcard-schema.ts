// Flashcard form validation schema using Zod

import { z } from 'zod'

export const flashcardSchema = z.object({
  sentence: z.string()
    .min(10, '文献句子至少需要 10 个字符')
    .max(1000, '文献句子不能超过 1000 个字符')
    .trim(),
  word: z.string()
    .min(1, '生词不能为空')
    .max(100, '生词不能超过 100 个字符')
    .trim()
    .regex(/^[a-zA-Z\s\-']+$/, '生词只能包含英文字母、空格、连字符和撇号'),
  translation: z.string()
    .min(1, '中文翻译不能为空')
    .max(200, '中文翻译不能超过 200 个字符')
    .trim()
    .regex(/[\u4e00-\u9fa5]/, '中文翻译至少需要包含一个中文字符'),
  definition: z.string()
    .max(500, '学术定义不能超过 500 个字符')
    .optional()
    .or(z.literal('')),
  domain: z.string()
    .max(50, '学科领域不能超过 50 个字符')
    .optional()
    .or(z.literal(''))
})

export type FlashcardFormData = z.infer<typeof flashcardSchema>
