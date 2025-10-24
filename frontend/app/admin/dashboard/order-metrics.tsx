'use client'

import { useState } from 'react'
import { Package, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface OrderMetricsData {
  daily: number
  weekly: number
  monthly: number
  completed: number
  pending: number
  cancelled?: number
  inProgress?: number
  revenue?: number
}

interface OrderMetricsProps {
  data: OrderMetricsData
  className?: string
  period?: 'day' | 'week' | 'month'
}

const metricCards = [
  {
    key: 'daily',
    label: 'Today',
    description: 'Orders placed today',
    icon: Package,
    trend: true,
  },
  {
    key: 'weekly',
    label: 'This Week',
    description: 'Orders this week',
    icon: Package,
    trend: true,
  },
  {
    key: 'monthly',
    label: 'This Month',
    description: 'Orders this month',
    icon: Package,
    trend: true,
  },
  {
    key: 'completed',
    label: 'Completed',
    description: 'Successfully delivered',
    icon: CheckCircle,
    color: 'text-green-600 bg-green-50',
  },
  {
    key: 'pending',
    label: 'Pending',
    description: 'Awaiting processing',
    icon: Clock,
    color: 'text-yellow-600 bg-yellow-50',
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    description: 'Cancelled orders',
    icon: XCircle,
    color: 'text-red-600 bg-red-50',
  },
]

export function OrderMetrics({ data, className, period = 'day' }: OrderMetricsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>(period)

const getTrendData = (key: keyof OrderMetricsData) => {
  // Explicitly type trends as a partial record of all possible keys
  const trends: Partial<Record<keyof OrderMetricsData, { value: number; direction: 'up' | 'down' | 'stable' }>> = {
    daily: { value: 12, direction: 'up' },
    weekly: { value: 8, direction: 'up' },
    monthly: { value: 15, direction: 'up' },
    completed: { value: 5, direction: 'up' },
    pending: { value: -2, direction: 'down' },
    cancelled: { value: 0, direction: 'stable' },
  }

  return trends[key] ?? { value: 0, direction: 'stable' }
}


  const getPeriodData = () => {
    switch (selectedPeriod) {
      case 'day':
        return { label: 'Today', value: data.daily }
      case 'week':
        return { label: 'This Week', value: data.weekly }
      case 'month':
        return { label: 'This Month', value: data.monthly }
      default:
        return { label: 'Today', value: data.daily }
    }
  }

  const periodData = getPeriodData()

  const getCompletionRate = () => {
    const total = data.completed + data.pending + (data.cancelled || 0)
    return total > 0 ? Math.round((data.completed / total) * 100) : 0
  }

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <span className="h-4 w-4 text-gray-400">-</span>
    }
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Order Metrics</h3>
          <p className="text-sm text-gray-500 mt-1">Real-time order statistics</p>
        </div>
        <Package className="h-6 w-6 text-gray-400" />
      </div>

      {/* Period Selector */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {(['day', 'week', 'month'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={cn(
              'flex-1 py-2 text-sm font-medium rounded-md transition-colors duration-150',
              selectedPeriod === period
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Main Metric */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">Total Orders</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{periodData.value}</p>
            <p className="text-sm text-blue-700 mt-1">{periodData.label}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end space-x-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">+12%</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">vs last period</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {metricCards.map((card) => {
          const value = data[card.key as keyof OrderMetricsData] || 0
          const trend = getTrendData(card.key as keyof OrderMetricsData)
          const Icon = card.icon

          return (
            <div
              key={card.key}
              className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors duration-150"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={cn(
                  'p-2 rounded-lg',
                  card.color || 'text-gray-600 bg-gray-50'
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                {card.trend && (
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(trend.direction)}
                    <span className={cn(
                      'text-xs font-medium',
                      trend.direction === 'up' ? 'text-green-600' :
                      trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                    )}>
                      {trend.direction !== 'stable' && `${Math.abs(trend.value)}%`}
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-lg font-semibold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Completion Rate */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">Completion Rate</span>
          <span className="text-sm font-semibold text-green-600">{getCompletionRate()}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${getCompletionRate()}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Completed: {data.completed}</span>
          <span>Total: {data.completed + data.pending + (data.cancelled || 0)}</span>
        </div>
      </div>

      {/* Quick Stats */}
      {data.revenue && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Revenue</span>
            <span className="text-sm font-semibold text-gray-900">
              ₹{data.revenue.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-green-600 mt-1">
            <TrendingUp className="h-3 w-3" />
            <span className="text-xs">+8% from last period</span>
          </div>
        </div>
      )}
    </div>
  )
}