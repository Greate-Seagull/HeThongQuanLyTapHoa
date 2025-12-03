'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { InventoryForm } from '@/components/management/InventoryForm'
import { ImportForm } from '@/components/management/ImportForm'
import { InvoiceManagement } from '@/components/management/InvoiceManagement'
import { ClipboardCheck, PackagePlus, FileText } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useRouter } from 'next/navigation'

export default function StaffDashboardPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState('')

  // Determine menu items based on staff position
  const getMenuItems = () => {
    const position = user?.employeeData?.position || ''
    
    if (position === 'INVENTORY') {
      return [
        { id: 'inventory', label: 'Phiếu kiểm kê', icon: <ClipboardCheck className="h-4 w-4" /> },
      ]
    } else if (position === 'RECEIVING') {
      return [
        { id: 'import', label: 'Phiếu nhập hàng', icon: <PackagePlus className="h-4 w-4" /> },
      ]
    } else if (position === 'SALES') {
      return [
        { id: 'invoice', label: 'Hóa đơn', icon: <FileText className="h-4 w-4" /> },
      ]
    }
    
    // Default: show all
    return [
      { id: 'inventory', label: 'Phiếu kiểm kê', icon: <ClipboardCheck className="h-4 w-4" /> },
      { id: 'import', label: 'Phiếu nhập hàng', icon: <PackagePlus className="h-4 w-4" /> },
      { id: 'invoice', label: 'Hóa đơn', icon: <FileText className="h-4 w-4" /> },
    ]
  }

  const menuItems = getMenuItems()
  
  useEffect(() => {
    // Check authentication
    if (!user || user.role !== 'staff') {
      router.push('/auth/login')
      return
    }
    
    // Set default active menu based on first menu item
    if (!activeMenu && menuItems.length > 0) {
      setActiveMenu(menuItems[0].id)
    }
  }, [user, router, activeMenu, menuItems])

  const renderContent = () => {
    if (!user?.employeeData) return null
    
    switch (activeMenu) {
      case 'inventory':
        return <InventoryForm currentUser={user.employeeData} />
      case 'import':
        return <ImportForm currentUser={user.employeeData} />
      case 'invoice':
        return <InvoiceManagement currentUser={user.employeeData} />
      default:
        return <InventoryForm currentUser={user.employeeData} />
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
