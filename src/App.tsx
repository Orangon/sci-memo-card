import { useState, useEffect } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { BookOpen, Plus, BarChart3, Settings, FlipHorizontal, RotateCcw } from 'lucide-react'

// API基础URL
const API_BASE_URL = 'http://localhost:8000/api'

// 闪卡类型定义
interface Flashcard {
  id: number
  sentence: string
  word: string
  translation: string
  definition: string
  domain: string
  mastery: number
  review_count: number
  next_review: string
  created_at: string
}

function App() {
  const [activeTab, setActiveTab] = useState('review')
  const [sentence, setSentence] = useState('')
  const [selectedWord, setSelectedWord] = useState('')
  const [translation, setTranslation] = useState('')
  const [definition, setDefinition] = useState('')
  const [domain, setDomain] = useState('')
  const [isFlipped, setIsFlipped] = useState(false)
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null)
  const [reviewCards, setReviewCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // API调用函数
  const fetchDailyRandomCards = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/cards/daily-random?limit=10`)
      if (!response.ok) {
        throw new Error('获取随机卡片失败')
      }
      const cards = await response.json()
      setReviewCards(cards)
      if (cards.length > 0) {
        setCurrentCard(cards[0])
        setCurrentIndex(0)
      }
      toast({
        title: "成功",
        description: `已加载 ${cards.length} 张复习卡片`,
      })
    } catch (error) {
      console.error('获取随机卡片失败:', error)
      toast({
        title: "错误",
        description: "获取复习卡片失败，请检查后端服务",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const submitReviewResult = async (mastery: number) => {
    if (!currentCard) return

    try {
      const response = await fetch(`${API_BASE_URL}/cards/${currentCard.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mastery })
      })

      if (!response.ok) {
        throw new Error('提交复习结果失败')
      }

      const result = await response.json()
      
      toast({
        title: "复习完成",
        description: result.message,
      })

      // 移动到下一张卡片
      goToNextCard()
    } catch (error) {
      console.error('提交复习结果失败:', error)
      toast({
        title: "错误",
        description: "提交复习结果失败",
        variant: "destructive"
      })
    }
  }

  const addNewFlashcard = async () => {
    if (!sentence || !selectedWord || !translation) {
      toast({
        title: "警告",
        description: "请填写完整的闪卡信息",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cards/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sentence,
          word: selectedWord,
          translation,
          definition,
          domain
        })
      })

      if (!response.ok) {
        throw new Error('添加闪卡失败')
      }

      const newCard = await response.json()
      
      toast({
        title: "成功",
        description: `闪卡 "${selectedWord}" 已添加`,
      })

      // 清空表单
      setSentence('')
      setSelectedWord('')
      setTranslation('')
      setDefinition('')
      setDomain('')

      // 重新加载复习卡片
      fetchDailyRandomCards()
    } catch (error) {
      console.error('添加闪卡失败:', error)
      toast({
        title: "错误",
        description: "添加闪卡失败",
        variant: "destructive"
      })
    }
  }

  // 导航函数
  const goToNextCard = () => {
    if (reviewCards.length === 0) return
    
    const nextIndex = (currentIndex + 1) % reviewCards.length
    setCurrentIndex(nextIndex)
    setCurrentCard(reviewCards[nextIndex])
    setIsFlipped(false)
  }

  const goToPrevCard = () => {
    if (reviewCards.length === 0) return
    
    const prevIndex = (currentIndex - 1 + reviewCards.length) % reviewCards.length
    setCurrentIndex(prevIndex)
    setCurrentCard(reviewCards[prevIndex])
    setIsFlipped(false)
  }

  // 初始化加载
  useEffect(() => {
    if (activeTab === 'review') {
      fetchDailyRandomCards()
    }
  }, [activeTab])

  const handleAddFlashcard = () => {
    addNewFlashcard()
  }

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">科研单词闪卡</h1>
            <p className="text-gray-600">基于语境记忆和间隔重复的科学学习工具</p>
          </header>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="review" className="flex items-center gap-2">
                <FlipHorizontal className="w-4 h-4" />
                复习
              </TabsTrigger>
              <TabsTrigger value="add" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                添加
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                统计
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                设置
              </TabsTrigger>
            </TabsList>

            {/* 复习页面 */}
            <TabsContent value="review">
              <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>闪卡复习</CardTitle>
                  <CardDescription>基于遗忘曲线的智能复习系统</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {isLoading ? (
                      // 加载状态
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">正在加载复习卡片...</p>
                      </div>
                    ) : currentCard ? (
                      // 正常显示卡片
                      <div className="space-y-6">
                        {/* 卡片导航和信息 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>卡片 {currentIndex + 1} / {reviewCards.length}</span>
                            <Badge variant={currentCard.next_review && new Date(currentCard.next_review) <= new Date() ? "destructive" : "secondary"}>
                              {currentCard.next_review && new Date(currentCard.next_review) <= new Date() ? "待复习" : "未到期"}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={goToPrevCard} disabled={currentIndex === 0}>
                              上一张
                            </Button>
                            <Button variant="ghost" size="sm" onClick={goToNextCard} disabled={currentIndex === reviewCards.length - 1}>
                              下一张
                            </Button>
                          </div>
                        </div>

                        {/* 句子展示区域 */}
                        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                          <div className="text-center">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
                              <BookOpen className="w-4 h-4 mr-1" />
                              科研文献句子
                            </div>
                            <p className="text-xl text-gray-800 mb-6 leading-relaxed font-serif">
                              {currentCard.sentence.split(' ').map((word, index) => (
                                word.toLowerCase() === currentCard.word.toLowerCase() ? (
                                  <span 
                                    key={index}
                                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-1 rounded-lg font-bold mx-1 shadow-md hover:shadow-lg transition-shadow duration-200"
                                  >
                                    {word}
                                  </span>
                                ) : (
                                  <span key={index} className="mx-1">{word}</span>
                                )
                              ))}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                              观察高亮显示的单词，尝试回忆其学术含义
                            </p>
                          </div>
                        </div>

                        {/* 解释卡片区域 */}
                        <div 
                          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-[1.02] border-2 border-dashed border-blue-300 hover:border-blue-400"
                          onClick={handleFlipCard}
                        >
                          {!isFlipped ? (
                            <div className="text-center">
                              <div className="flex flex-col items-center justify-center gap-3 text-blue-700">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                  <FlipHorizontal className="w-6 h-6" />
                                </div>
                                <div>
                                  <p className="font-semibold">点击查看单词解释</p>
                                  <p className="text-sm text-blue-600 mt-1">包含中文翻译和学术定义</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center space-y-4">
                              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200 rounded-xl px-6 py-4 mx-auto max-w-md shadow-sm">
                                <p className="text-2xl font-bold text-yellow-900 mb-2">
                                  {currentCard.word}
                                </p>
                                <p className="text-lg text-orange-800 font-medium mb-3">{currentCard.translation}</p>
                                <div className="bg-white rounded-lg px-3 py-2">
                                  <p className="text-sm text-gray-700 leading-tight">{currentCard.definition}</p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="bg-blue-200 text-blue-800 px-3 py-1.5 text-sm">
                                📚 {currentCard.domain}
                              </Badge>
                              <div className="text-xs text-gray-500">
                                掌握程度: {['不熟', '一般', '熟练'][currentCard.mastery - 1]} | 
                                复习次数: {currentCard.review_count}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 评分按钮 */}
                        <div className="flex gap-4 justify-center">
                          <Button 
                            variant="outline" 
                            className="bg-red-100 text-red-700 hover:bg-red-200"
                            onClick={() => submitReviewResult(1)}
                          >
                            不熟
                          </Button>
                          <Button 
                            variant="outline" 
                            className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            onClick={() => submitReviewResult(2)}
                          >
                            一般
                          </Button>
                          <Button 
                            variant="outline" 
                            className="bg-green-100 text-green-700 hover:bg-green-200"
                            onClick={() => submitReviewResult(3)}
                          >
                            熟练
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // 无卡片状态
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 mb-4">暂无复习卡片</p>
                        <Button onClick={fetchDailyRandomCards}>
                          <RotateCcw className="w-4 h-4 mr-2" />
                          重新加载
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 添加页面 */}
            <TabsContent value="add">
              <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>添加生词</CardTitle>
                  <CardDescription>从科研文献中提取生词并添加上下文</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sentence">文献句子</Label>
                      <Textarea
                        id="sentence"
                        placeholder="粘贴包含生词的科研文献句子..."
                        value={sentence}
                        onChange={(e) => setSentence(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="word">生词</Label>
                      <Input
                        id="word"
                        placeholder="输入生词..."
                        value={selectedWord}
                        onChange={(e) => setSelectedWord(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="translation">中文翻译</Label>
                      <Input
                        id="translation"
                        placeholder="输入中文翻译..."
                        value={translation}
                        onChange={(e) => setTranslation(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="definition">学术定义</Label>
                      <Textarea
                        id="definition"
                        placeholder="输入学术定义和解释..."
                        value={definition}
                        onChange={(e) => setDefinition(e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="domain">学科领域</Label>
                      <Input
                        id="domain"
                        placeholder="输入学科领域..."
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                      />
                    </div>

                    <Button onClick={handleAddFlashcard} className="w-full">
                      添加闪卡
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 统计页面 */}
            <TabsContent value="stats">
              <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>学习统计</CardTitle>
                  <CardDescription>跟踪你的学习进度和掌握情况</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white rounded-lg shadow">
                        <div className="text-2xl font-bold text-blue-600">24</div>
                        <div className="text-sm text-gray-600">总生词量</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow">
                        <div className="text-2xl font-bold text-green-600">18</div>
                        <div className="text-sm text-gray-600">已掌握</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow">
                        <div className="text-2xl font-bold text-yellow-600">75%</div>
                        <div className="text-sm text-gray-600">掌握率</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">学习进度</h3>
                      <Progress value={75} className="w-full" />
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">学科分布</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>量子物理</span>
                          <span className="text-gray-600">8个</span>
                        </div>
                        <div className="flex justify-between">
                          <span>遗传学</span>
                          <span className="text-gray-600">6个</span>
                        </div>
                        <div className="flex justify-between">
                          <span>人工智能</span>
                          <span className="text-gray-600">4个</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 设置页面 */}
            <TabsContent value="settings">
              <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>设置</CardTitle>
                  <CardDescription>个性化你的学习体验</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>复习间隔设置</Label>
                      <div className="text-sm text-gray-500 mt-1">
                        基于遗忘曲线自动调整复习频率
                      </div>
                    </div>
                    
                    <div>
                      <Label>数据导出</Label>
                      <Button variant="outline" className="w-full mt-2">
                        导出学习数据 (JSON)
                      </Button>
                    </div>

                    <div>
                      <Label>默认学科领域</Label>
                      <Input placeholder="例如: 计算机科学, 生物学..." />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App