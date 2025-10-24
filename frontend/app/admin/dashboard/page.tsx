'use client'
import { useQuery } from '@tanstack/react-query'
import { QuickActions } from './quick-actions'
import { DashboardStats } from './stats'
import { RecentActivity } from './recent-activity'
import { OrderMetrics } from './order-metrics'
import { VehicleOverview } from './vehicle-overview'

async function fetchAdminDashboard() {
  const response = await fetch('/api/admin/dashboard')
  if (!response.ok) throw new Error('Failed to fetch dashboard data')
  return response.json()
}

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchAdminDashboard,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading dashboard data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your delivery operations</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <QuickActions />
      <DashboardStats stats={data.stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderMetrics data={data.orders} />
        <VehicleOverview vehicles={data.vehicles} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Map or chart component can go here */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Overview</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Map/Chart Component</p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <RecentActivity activities={data.recentActivities} />
        </div>
      </div>
    </div>
  )
}