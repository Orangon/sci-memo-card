'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Controller, useFormContext } from 'react-hook-form'
import { SentenceInput } from './SentenceInput'

interface FlashcardFormFieldsProps {
  // register, errors, control are now optional - primarily for backward compatibility
  // with EditFlashcardDialog which may not use FormProvider
  register?: any // Generic register that works with both FlashcardFormData and UpdateFlashcardFormData
  errors?: any // Generic errors object
  control?: any // For Controller component (optional for edit dialog)
  presetDomains?: string[] // List of preset domain names
}

/**
 * Reusable form fields component for flashcard creation and editing.
 * Used by both FlashcardForm (Card) and EditFlashcardDialog (Dialog).
 */
export function FlashcardFormFields({ register, errors: propsErrors, control, presetDomains }: FlashcardFormFieldsProps) {
  // Get form context to access form methods like setValue, watch, trigger
  const form = useFormContext()

  // Use errors from props if provided (for EditFlashcardDialog), otherwise get from form context
  const errors = propsErrors || form.formState.errors

  /**
   * Handle word selection from the extracted words list
   * Sets the word field value and triggers validation
   */
  const handleWordSelect = (word: string) => {
    form.setValue('word', word)
    form.trigger('word')
  }

  /**
   * Handle clearing the word selection
   * Clears the word field value
   */
  const handleClearSelection = () => {
    form.setValue('word', '')
    form.trigger('word')
  }

  return (
    <>
      {/* 文献句子 with word split feature */}
      <SentenceInput
        value={form.watch('sentence') || ''}
        onChange={(value) => form.setValue('sentence', value)}
        onWordSelect={handleWordSelect}
        onClearSelection={handleClearSelection}
        selectedWord={form.watch('word')}
        error={errors.sentence?.message}
      />

      {/* 生词 - remains fully editable */}
      <div className="space-y-2">
        <Label htmlFor="word">生词</Label>
        <Textarea
          id="word"
          placeholder="输入生词或从上方选择..."
          className={`min-h-[60px] ${errors.word ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          {...(register || form.register)('word')}
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
          {...(register || form.register)('translation')}
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
          {...(register || form.register)('definition')}
        />
        {errors.definition && (
          <p className="text-sm text-destructive">{errors.definition.message}</p>
        )}
      </div>

      {/* 学科领域 - Radio Group for preset domains + custom input */}
      <div className="space-y-3">
        <Label htmlFor="domain">学科领域</Label>

        {presetDomains && presetDomains.length > 0 && (control || form.control) && (
          <Controller
            name="domain"
            control={control || form.control}
            render={({ field }) => (
              <RadioGroup
                value={field.value || ''}
                onValueChange={field.onChange}
                className="grid grid-cols-2 md:grid-cols-3 gap-2"
              >
                {presetDomains.map((domainName) => (
                  <div key={domainName} className="flex items-center space-x-2">
                    <RadioGroupItem value={domainName} id={`domain-${domainName}`} />
                    <Label
                      htmlFor={`domain-${domainName}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {domainName}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        )}

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">或输入自定义领域:</div>
          <Input
            id="domain"
            placeholder="例如: 计算机科学, 生物学..."
            className={errors.domain ? 'border-destructive' : ''}
            {...(register || form.register)('domain')}
          />
        </div>

        {errors.domain && (
          <p className="text-sm text-destructive">{errors.domain.message}</p>
        )}
      </div>
    </>
  )
}
