import { MutationOptions } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'

/**
 * Global error handler for API mutations
 * Automatically shows toast notifications for errors
 */
export function handleMutationError(error: unknown) {
  let message = '操作失败'

  if (error instanceof Error) {
    message = error.message
  } else if (typeof error === 'string') {
    message = error
  }

  // Use setTimeout to ensure Toaster has mounted and subscribed to listeners
  setTimeout(() => {
    toast({
      title: '错误',
      description: message,
      variant: 'destructive',
    })
  }, 0)
}

/**
 * Wraps mutation options with automatic error handling
 * Usage: useMutation(withErrorHandler({ mutationFn: ... }))
 */
export function withErrorHandler<TData, TError, TVariables, TContext = unknown>(
  options: MutationOptions<TData, TError, TVariables, TContext>
): MutationOptions<TData, TError, TVariables, TContext> {
  return {
    ...options,
    onError: (error, variables, context, snapshotValue) => {
      handleMutationError(error)
      options.onError?.(error, variables, context as TContext, snapshotValue)
    },
  }
}
