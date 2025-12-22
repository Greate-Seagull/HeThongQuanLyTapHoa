'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ProfilePage } from '@/components/ProfilePage'
import { InventoryForm } from '@/components/management/InventoryForm'
import { ImportForm } from '@/components/management/ImportForm'
import { InvoiceManagement } from '@/components/management/InvoiceManagement'
import { ClipboardCheck, PackagePlus, FileText, User } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { apiClient } from '@/services/api-client'

export default function StaffDashboardPage() {
  const { user, login } = useAuthStore() as any
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Determine menu items based on staff position
  const getMenuItems = () => {
    const position = user?.employeeData?.position || ''
    
    // ✅ CRITICAL FIX: Manager không có tab profile, chỉ có 3 tabs chức năng
    if (position === 'MANAGER') {
      return [
        { id: 'inventory', label: 'Phiếu kiểm kê', icon: <ClipboardCheck className="h-4 w-4" /> },
        { id: 'import', label: 'Phiếu nhập hàng', icon: <PackagePlus className="h-4 w-4" /> },
        { id: 'invoice', label: 'Hóa đơn', icon: <FileText className="h-4 w-4" /> },
      ]
    }
    
    // Profile item cho các position khác (INVENTORY, RECEIVING, SALES)
    const profileItem = { id: 'profile', label: 'Thông tin cá nhân', icon: <User className="h-4 w-4" /> }
    
    if (position === 'INVENTORY') {
      return [
        { id: 'inventory', label: 'Phiếu kiểm kê', icon: <ClipboardCheck className="h-4 w-4" /> },
        profileItem,
      ]
    } else if (position === 'RECEIVING') {
      return [
        { id: 'import', label: 'Phiếu nhập hàng', icon: <PackagePlus className="h-4 w-4" /> },
        profileItem,
      ]
    } else if (position === 'SALES') {
      return [
        { id: 'invoice', label: 'Hóa đơn', icon: <FileText className="h-4 w-4" /> },
        profileItem,
      ]
    }
    
    // Default: show all
    return [
      { id: 'inventory', label: 'Phiếu kiểm kê', icon: <ClipboardCheck className="h-4 w-4" /> },
      { id: 'import', label: 'Phiếu nhập hàng', icon: <PackagePlus className="h-4 w-4" /> },
      { id: 'invoice', label: 'Hóa đơn', icon: <FileText className="h-4 w-4" /> },
      profileItem,
    ]
  }

  const menuItems = getMenuItems()
  
  useEffect(() => {
    const checkAuth = async () => {
      // Nếu đã có user và đúng role -> OK
      if (user?.role === 'staff') {
        setIsLoading(false)
        return
      }

      // Nếu có user nhưng sai role -> Login
      if (user && user.role !== 'staff') {
        router.push('/auth/login')
        return
      }

      // Nếu chưa có user (F5), kiểm tra token
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/auth/login')
        return
      }

      // Có token, thử lấy lại thông tin nhân viên
      try {
        const response = await apiClient.get<any>('/employee-accounts/profile')
        // Khôi phục state user
        const userData = {
          username: response.username,
          role: 'staff',
          employeeData: response,
        }
        login(userData, token)
        setIsLoading(false)
      } catch (error) {
        console.error('Session restore failed:', error)
        localStorage.removeItem('accessToken')
        router.push('/auth/login')
      }
    }
    
    checkAuth()
  }, [user, router, login])

  // Set default active menu when user is loaded
  useEffect(() => {
    if (!isLoading && user && !activeMenu && menuItems.length > 0) {
      setActiveMenu(menuItems[0].id)
    }
  }, [isLoading, user, activeMenu, menuItems])

  const renderContent = () => {
    if (isLoading || !user || !user.employeeData) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Đang tải thông tin nhân viên...</p>
        </div>
      )
    }
    
    const employeeData = user.employeeData
    
    switch (activeMenu) {
      case 'inventory':
        return <InventoryForm currentUser={employeeData} />
      case 'import':
        return <ImportForm currentUser={employeeData} />
      case 'invoice':
        return <InvoiceManagement currentUser={employeeData} />
      case 'profile':
        // ✅ FIX: ProfilePage fetches its own data, no props needed
        return <ProfilePage />
      default:
        // Default to first available feature based on position
        if (employeeData.position === 'INVENTORY') {
          return <InventoryForm currentUser={employeeData} />
        } else if (employeeData.position === 'RECEIVING') {
          return <ImportForm currentUser={employeeData} />
        } else if (employeeData.position === 'SALES') {
          return <InvoiceManagement currentUser={employeeData} />
        }
        return <InvoiceManagement currentUser={employeeData} />
    }
  }

  if (!user) return null

  return (
    <DashboardLayout
      menuItems={menuItems}
      activeMenu={activeMenu}
      onMenuChange={setActiveMenu}
    >
      {renderContent()}
    </DashboardLayout>
  )
}
