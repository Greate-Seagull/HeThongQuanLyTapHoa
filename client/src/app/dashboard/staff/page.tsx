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
import type { ReactNode } from 'react' // ✅ FIX: Import ReactNode type

// ✅ FIX: Use ReactNode instead of JSX.Element
interface MenuItem {
  id: string
  label: string
  icon: ReactNode
}

export default function StaffDashboardPage() {
  const { user, login } = useAuthStore() as any
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is MANAGER accessing staff features
  const isManagerAccessingStaff = user?.employeeData?.position === 'MANAGER' && user?.role === 'staff';

  // Determine menu items based on staff position
  const getMenuItems = (): MenuItem[] => {
    const position = user?.employeeData?.position || ''
    
    // MANAGER gets ALL staff features (no profile)
    if (position === 'MANAGER') {
      return [
        { id: 'inventory', label: 'Phiếu kiểm kê', icon: <ClipboardCheck className="h-4 w-4" /> },
        { id: 'import', label: 'Phiếu nhập hàng', icon: <PackagePlus className="h-4 w-4" /> },
        { id: 'invoice', label: 'Hóa đơn', icon: <FileText className="h-4 w-4" /> },
      ]
    }
    
    // Profile item for non-MANAGER staff
    const profileItem: MenuItem = { 
      id: 'profile', 
      label: 'Thông tin cá nhân', 
      icon: <User className="h-4 w-4" /> 
    }
    
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
    
    // Default: show all with profile
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
      if (user?.role === 'staff') {
        setIsLoading(false)
        return
      }

      if (user && user.role !== 'staff') {
        router.push('/auth/login')
        return
      }

      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/auth/login')
        return
      }

      try {
        const response = await apiClient.get<any>('/employee-accounts/profile')
        console.log('🔍 Profile response:', response)
        
        const userData = {
          username: response.username,
          role: 'staff',
          employeeData: {
            id: response.employeeId,
            accountId: response.id,
            name: response.name,
            position: response.position,
          },
        }
        
        console.log('✅ User data created:', userData)
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
    console.log('🔍 Current employee data for form:', employeeData)
    
    switch (activeMenu) {
      case 'inventory':
        return <InventoryForm currentUser={employeeData} />
      case 'import':
        return <ImportForm currentUser={employeeData} />
      case 'invoice':
        return <InvoiceManagement currentUser={employeeData} />
      case 'profile':
        if (isManagerAccessingStaff) {
          return (
            <div className="text-center py-12">
              <p className="text-gray-500">Quản lý không có trang thông tin cá nhân riêng ở đây.</p>
              <p className="text-sm text-gray-400 mt-2">Vui lòng quay lại trang chủ Owner để xem thông tin.</p>
            </div>
          )
        }
        return <ProfilePage />
      default:
        if (employeeData.position === 'MANAGER') {
          return <InventoryForm currentUser={employeeData} />
        } else if (employeeData.position === 'INVENTORY') {
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
