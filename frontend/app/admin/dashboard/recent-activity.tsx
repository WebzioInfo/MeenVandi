'use client'

import { useState } from 'react'
import { Clock, Package, User, Truck, MapPin, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface Activity {
  id: string
  type: 'order_created' | 'order_delivered' | 'vehicle_updated' | 'user_registered' | 'stop_completed' | 'payment_received' | 'system_alert'
  description: string
  timestamp: string
  user?: string
  status?: 'success' | 'warning' | 'error' | 'info'
}

interface RecentActivityProps {
  activities?: Activity[]
  maxItems?: number
  className?: string
}

const activityIcons = {
  order_created: Package,
  order_delivered: CheckCircle,
  vehicle_updated: Truck,
  user_registered: User,
  stop_completed: MapPin,
  payment_received: CheckCircle,
  system_alert: AlertCircle,
}

const statusColors = {
  success: 'text-green-500 bg-green-50 border-green-200',
  warning: 'text-yellow-500 bg-yellow-50 border-yellow-200',
  error: 'text-red-500 bg-red-50 border-red-200',
  info: 'text-blue-500 bg-blue-50 border-blue-200',
  default: 'text-gray-500 bg-gray-50 border-gray-200',
}

export function RecentActivity({ activities = [], maxItems = 10, className }: RecentActivityProps) {
  const [visibleItems, setVisibleItems] = useState(maxItems)

  const displayedActivities = activities.slice(0, visibleItems)

  const getActivityIcon = (type: Activity['type'], status?: Activity['status']) => {
    const Icon = activityIcons[type]
    const statusColor = status ? statusColors[status] : statusColors.default
    
    return (
      <div className={cn(
        'shrink-0 w-8 h-8 rounded-full border flex items-center justify-center',
        statusColor
      )}>
        <Icon className="h-4 w-4" />
      </div>
    )
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60)
      return `${minutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getActivityDescription = (activity: Activity) => {
    if (activity.description) return activity.description

    const baseDescriptions = {
      order_created: 'New order was created',
      order_delivered: 'Order was delivered successfully',
      vehicle_updated: 'Vehicle information was updated',
      user_registered: 'New user registered',
      stop_completed: 'Delivery stop completed',
      payment_received: 'Payment received',
      system_alert: 'System alert',
    }

    return baseDescriptions[activity.type] || 'Activity occurred'
  }

  if (activities.length === 0) {
    return (
      <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <Clock className="h-5 w-5 text-gray-400" />
        </div>
        <div className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
          <p className="mt-1 text-sm text-gray-500">Activity will appear here as it happens.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Last 24h</span>
        </div>
      </div>

      <div className="space-y-4">
        {displayedActivities.map((activity, index) => (
          <div
            key={activity.id || index}
            className="flex items-start space-x-3 group hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors duration-150"
          >
            {getActivityIcon(activity.type, activity.status)}
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 leading-5">
                {getActivityDescription(activity)}
              </p>
              
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">
                  {formatTime(activity.timestamp)}
                </span>
                
                {activity.user && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-600 font-medium">
                      {activity.user}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length > visibleItems && (
        <button
          onClick={() => setVisibleItems(prev => prev + 5)}
          className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium py-2 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors duration-150"
        >
          Load More Activities
        </button>
      )}

      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Total activities: {activities.length}</span>
            <span>Showing {displayedActivities.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}