'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { Flashcard } from '@/lib/types'
import { withErrorHandler } from '@/lib/mutation-handler'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { EditFlashcardDialog } from './EditFlashcardDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type SortField = 'created_at' | 'mastery' | 'word' | 'domain'
type SortOrder = 'asc' | 'desc'

export function CardManagement() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cardToDelete, setCardToDelete] = useState<Flashcard | null>(null)

  // Fetch all cards
  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['all-cards'],
    queryFn: () => apiClient.getAllCards(),
  })

  // Delete mutation
  const deleteMutation = useMutation(
    withErrorHandler({
      mutationFn: (id: number) => apiClient.deleteCard(id),
      onSuccess: () => {
        toast({
          title: '成功',
          description: '闪卡已删除',
        })
        queryClient.invalidateQueries({ queryKey: ['all-cards'] })
        queryClient.invalidateQueries({ queryKey: ['daily-random-cards'] })
      },
    })
  )

  // Sort cards
  const sortedCards = [...cards].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
      case 'mastery':
        comparison = a.mastery - b.mastery
        break
      case 'word':
        comparison = a.word.localeCompare(b.word)
        break
      case 'domain':
        comparison = a.domain.localeCompare(b.domain)
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    )
  }

  const getMasteryBadge = (mastery: number) => {
    switch (mastery) {
      case 1:
        return <Badge variant="destructive">不熟</Badge>
      case 2:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">一般</Badge>
      case 3:
        return <Badge className="bg-green-500 hover:bg-green-600">熟练</Badge>
      default:
        return <Badge>未知</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const handleDelete = () => {
    if (cardToDelete) {
      deleteMutation.mutate(cardToDelete.id)
      setDeleteDialogOpen(false)
      setCardToDelete(null)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>卡片管理</CardTitle>
            <CardDescription>查看、编辑和删除闪卡</CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            共 {cards.length} 张
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="text-muted-foreground">加载中...</div>
          </div>
        ) : cards.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="text-muted-foreground">暂无闪卡</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('word')}
                >
                  <div className="flex items-center">
                    单词
                    {getSortIcon('word')}
                  </div>
                </TableHead>
                <TableHead>领域</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('mastery')}
                >
                  <div className="flex items-center">
                    掌握度
                    {getSortIcon('mastery')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center">
                    日期
                    {getSortIcon('created_at')}
                  </div>
                </TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="font-medium">{card.word}</TableCell>
                  <TableCell>{card.domain || '通用'}</TableCell>
                  <TableCell>{getMasteryBadge(card.mastery)}</TableCell>
                  <TableCell>{formatDate(card.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingCard(card)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog
                        open={deleteDialogOpen && cardToDelete?.id === card.id}
                        onOpenChange={(open) => {
                          setDeleteDialogOpen(open)
                          if (!open) setCardToDelete(null)
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setCardToDelete(card)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>确认删除</AlertDialogTitle>
                            <AlertDialogDescription>
                              确定要删除闪卡 "{card.word}" 吗？此操作无法撤销。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>
                              删除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {editingCard && (
        <EditFlashcardDialog
          card={editingCard}
          open={!!editingCard}
          onOpenChange={(open) => {
            if (!open) setEditingCard(null)
          }}
        />
      )}
    </Card>
  )
}
