import { Users, Truck, Package, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

interface StatsData {
  totalUsers: number
  totalVehicles: number
  totalOrders: number
  totalRevenue: number
  activeVehicles: number
  pendingOrders: number
  completedOrders: number
}

interface DashboardStatsProps {
  stats: StatsData
}

const StatCard = ({ title, value, growth, icon: Icon, trend, subtitle }: {
  title: string
  value: string | number
  growth?: number
  icon: any
  trend?: 'up' | 'down'
  subtitle?: string
}) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
        {growth !== undefined && (
          <div className={`flex items-center mt-2 text-sm ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            <span>{growth}% from last month</span>
          </div>
        )}
      </div>
      <div className="p-3 bg-blue-50 rounded-lg">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
    </div>
  </div>
)

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Users"
        value={stats.totalUsers.toLocaleString()}
        growth={12}
        icon={Users}
        trend="up"
      />
      <StatCard
        title="Active Vehicles"
        value={stats.activeVehicles}
        subtitle={`of ${stats.totalVehicles} total`}
        icon={Truck}
        trend="up"
      />
      <StatCard
        title="Total Orders"
        value={stats.totalOrders.toLocaleString()}
        growth={8}
        icon={Package}
        trend="up"
      />
      <StatCard
        title="Total Revenue"
        value={`₹${stats.totalRevenue.toLocaleString()}`}
        growth={15}
        icon={DollarSign}
        trend="up"
      />
    </div>
  )
}