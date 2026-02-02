'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface FlashcardFormFieldsProps {
  register: any // Generic register that works with both FlashcardFormData and UpdateFlashcardFormData
  errors: any // Generic errors object
}

/**
 * Reusable form fields component for flashcard creation and editing.
 * Used by both FlashcardForm (Card) and EditFlashcardDialog (Dialog).
 */
export function FlashcardFormFields({ register, errors }: FlashcardFormFieldsProps) {
  return (
    <>
      {/* 文献句子 */}
      <div className="space-y-2">
        <Label htmlFor="sentence">文献句子</Label>
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
        <Label htmlFor="word">生词</Label>
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
        <Label htmlFor="translation">中文翻译</Label>
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
        <Label htmlFor="definition">学术定义</Label>
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
        <Label htmlFor="domain">学科领域</Label>
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
    </>
  )
}
