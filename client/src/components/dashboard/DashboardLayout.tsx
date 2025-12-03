'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Store } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { toast } from 'sonner'

interface MenuItem {
  id: string
  label: string
  icon: ReactNode
}

interface DashboardLayoutProps {
  children: ReactNode
  menuItems: MenuItem[]
  activeMenu: string
  onMenuChange: (menuId: string) => void
}

export function DashboardLayout({ children, menuItems, activeMenu, onMenuChange }: DashboardLayoutProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    toast.success('Đã đăng xuất')
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-blue-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-blue-900 font-semibold">Quản Lý Tạp Hóa</div>
                <div className="text-sm text-gray-600">
                  {user?.username} 
                  {user?.employeeData && ` - ${user.employeeData.name}`}
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-blue-200 text-blue-900 hover:bg-blue-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
        </div>

        {/* Menu Items */}
        <div className="flex items-center gap-2 px-6 pb-3 overflow-x-auto">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeMenu === item.id ? 'default' : 'ghost'}
              onClick={() => onMenuChange(item.id)}
              className={
                activeMenu === item.id
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'text-blue-900 hover:bg-blue-50'
              }
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}
