'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/app/store/auth-store'
// import { AdminSidebar } from '@/app/components/admin/sidebar'
// import { AdminHeader } from '@/app/components/admin/header'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { AdminSidebar } from '../components/layout/sidebar'
import { AdminHeader } from '../components/layout/header'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated, loading, ready, initialize } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (ready && !loading) {
      if (!isAuthenticated || !user) {
        router.push('/login')
        return
      }
      
      // Check if user has admin role
      const adminRoles = ['super_admin', 'staff']
      if (!adminRoles.includes(user.role)) {
        router.push('/user/dashboard')
        return
      }
    }
  }, [isAuthenticated, user, loading, ready, router])

  if (loading || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const adminRoles = ['super_admin', 'staff']
  if (!adminRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar userRole={user.role} />
      <div className="flex-1 flex flex-col lg:pl-64">
        <AdminHeader/>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}