'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { FlipHorizontal, Plus, BarChart3, Settings, List } from 'lucide-react'

const navItems = [
  { href: '/add', label: '添加', icon: Plus },
  { href: '/review', label: '复习', icon: FlipHorizontal },
  { href: '/stats', label: '统计', icon: BarChart3 },
  { href: '/manage', label: '管理', icon: List },
  { href: '/settings', label: '设置', icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center gap-2 py-3">
          <Link href="/add" className="text-xl font-bold text-gray-800 dark:text-gray-100">
            科研单词闪卡
          </Link>
          <div className="flex gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
