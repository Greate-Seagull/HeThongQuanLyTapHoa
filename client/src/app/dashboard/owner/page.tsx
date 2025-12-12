'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ProfilePage } from '@/components/ProfilePage'
import { EmployeeManagement } from '@/components/management/EmployeeManagement'
import { PromotionManagement } from '@/components/management/PromotionManagement'
import { ProductManagement } from '@/components/management/ProductManagement'
import { LocationManagement } from '@/components/management/LocationManagement'
import { CustomerManagement } from '@/components/management/CustomerManagement'
import { Reports } from '@/components/management/Reports'
import { SupplierManagement } from '@/components/management/SupplierManagement'
import { ProductCategoryManagement } from '@/components/management/ProductCategoryManagement'
import { Users, Tag, Package, MapPin, UserCircle, BarChart3, User, Building2, FolderOpen } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'

export default function OwnerDashboardPage() {
  const { user } = useAuthStore()
  const [activeMenu, setActiveMenu] = useState('employees')

  const menuItems = [
    { id: 'employees', label: 'Nhân viên', icon: <Users className="h-4 w-4" /> },
    { id: 'promotions', label: 'Khuyến mãi', icon: <Tag className="h-4 w-4" /> },
    { id: 'products', label: 'Sản phẩm', icon: <Package className="h-4 w-4" /> },
    { id: 'suppliers', label: 'Nhà cung cấp', icon: <Building2 className="h-4 w-4" /> },
    { id: 'categories', label: 'Loại sản phẩm', icon: <FolderOpen className="h-4 w-4" /> },
    { id: 'locations', label: 'Vị trí', icon: <MapPin className="h-4 w-4" /> },
    { id: 'customers', label: 'Khách hàng', icon: <UserCircle className="h-4 w-4" /> },
    { id: 'reports', label: 'Báo cáo', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'profile', label: 'Thông tin cá nhân', icon: <User className="h-4 w-4" /> },
  ]

  const renderContent = () => {
    switch (activeMenu) {
      case 'employees':
        return <EmployeeManagement />
      case 'promotions':
        return <PromotionManagement />
      case 'products':
        return <ProductManagement />
      case 'suppliers':
        return <SupplierManagement />
      case 'categories':
        return <ProductCategoryManagement />
      case 'locations':
        return <LocationManagement />
      case 'customers':
        return <CustomerManagement />
      case 'reports':
        return <Reports />
      case 'profile':
        return (
          <ProfilePage
            user={{
              id: user?.employeeData?.id || 1,
              name: user?.employeeData?.name || 'Chủ cửa hàng',
              username: user?.username || 'admin',
              loggedAt: new Date(),
            }}
            role="owner"
          />
        )
      default:
        return <EmployeeManagement />
    }
  }

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
