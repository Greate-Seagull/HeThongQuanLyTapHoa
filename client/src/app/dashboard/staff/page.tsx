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

export default function StaffDashboardPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState('')

  // Determine menu items based on staff position
  const getMenuItems = () => {
    const position = user?.employeeData?.position || ''
    
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
    // Check authentication
    if (!user || user.role !== 'staff') {
      router.push('/auth/login')
      return
    }
    
    // Show warning if employee data is missing
    if (!user.employeeData) {
      toast.warning('Thông tin nhân viên chưa đầy đủ', {
        description: 'Một số tính năng có thể không hoạt động chính xác. Vui lòng liên hệ quản trị viên.',
      })
    }
    
    // Set default active menu based on first menu item
    if (!activeMenu && menuItems.length > 0) {
      setActiveMenu(menuItems[0].id)
    }
  }, [user, router, activeMenu, menuItems])

  const renderContent = () => {
    if (!user) return null
    
    // ⚠️ WORKAROUND: Backend doesn't return employee data on login
    // Use mock data until backend is fixed
    const mockEmployeeData = user.employeeData || {
      id: 1,
      name: user.username || 'Nhân viên',
      position: 'SALES', // Default to SALES
    }
    
    switch (activeMenu) {
      case 'inventory':
        return <InventoryForm currentUser={mockEmployeeData} />
      case 'import':
        return <ImportForm currentUser={mockEmployeeData} />
      case 'invoice':
        return <InvoiceManagement currentUser={mockEmployeeData} />
      case 'profile':
        return (
          <ProfilePage
            user={{
              id: mockEmployeeData.id,
              name: mockEmployeeData.name,
              username: user.username,
              position: mockEmployeeData.position,
              loggedAt: new Date(),
            }}
            role="staff"
          />
        )
      default:
        return <InvoiceManagement currentUser={mockEmployeeData} />
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
