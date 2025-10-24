'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Users,
  Truck,
  Package,
  MapPin,
  Route,
  Settings,
  Menu,
  X,
  CreditCard,
  Bell,
  Archive,
  Shield
} from 'lucide-react'

interface SidebarProps {
  userRole: string
}

const superAdminMenu = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Vehicles', href: '/admin/vehicles', icon: Truck },
  { name: 'Orders', href: '/admin/orders', icon: Package },
  { name: 'Routes', href: '/admin/routes', icon: Route },
  { name: 'Stops', href: '/admin/stops', icon: MapPin },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Inventory', href: '/admin/inventory', icon: Archive },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Admin Settings', href: '/admin/settings', icon: Shield },
]

const staffMenu = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
  { name: 'Vehicles', href: '/admin/vehicles', icon: Truck },
  { name: 'Orders', href: '/admin/orders', icon: Package },
  { name: 'Routes', href: '/admin/routes', icon: Route },
  { name: 'Stops', href: '/admin/stops', icon: MapPin },
  { name: 'Inventory', href: '/admin/inventory', icon: Archive },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
]

export function AdminSidebar({ userRole }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const navigation = userRole === 'super_admin' ? superAdminMenu : staffMenu

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/80 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">MeenVandi</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`
                  mr-3 h-5 w-5 transition-colors duration-200
                  ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                `} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User role badge */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-100 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-600">Role</p>
            <p className="text-sm font-semibold text-gray-900 capitalize">
              {userRole.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-lg border border-gray-200"
      >
        <Menu className="h-6 w-6 text-gray-600" />
      </button>
    </>
  )
}