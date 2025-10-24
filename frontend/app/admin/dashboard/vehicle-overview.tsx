'use client'

import { useState } from 'react'
import { Truck, MapPin, Battery, Wifi, WifiOff, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface Vehicle {
  id: string
  vehicleNumber: string
  driverName?: string
  status: 'active' | 'idle' | 'maintenance' | 'offline'
  currentLocation?: {
    lat: number
    lng: number
  }
  lastUpdate: string
  batteryLevel?: number
  currentRoute?: string
}

interface VehicleOverviewProps {
  vehicles?: Vehicle[]
  className?: string
}

const statusConfig = {
  active: {
    label: 'Active',
    color: 'text-green-600 bg-green-50 border-green-200',
    icon: Wifi,
  },
  idle: {
    label: 'Idle',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    icon: Clock,
  },
  maintenance: {
    label: 'Maintenance',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    icon: AlertTriangle,
  },
  offline: {
    label: 'Offline',
    color: 'text-gray-600 bg-gray-50 border-gray-200',
    icon: WifiOff,
  },
}

export function VehicleOverview({ vehicles = [], className }: VehicleOverviewProps) {
  const [filter, setFilter] = useState<'all' | Vehicle['status']>('all')

  const filteredVehicles = filter === 'all' 
    ? vehicles 
    : vehicles.filter(vehicle => vehicle.status === filter)

  const statusCounts = vehicles.reduce((acc, vehicle) => {
    acc[vehicle.status] = (acc[vehicle.status] || 0) + 1
    return acc
  }, {} as Record<Vehicle['status'], number>)

  const getStatusBadge = (status: Vehicle['status']) => {
    const config = statusConfig[status]
    const Icon = config.icon
    
    return (
      <span className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
        config.color
      )}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    )
  }

  const formatLastUpdate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)
    
    if (diffInMinutes < 1) {
      return 'Just now'
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`
    } else {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    }
  }

  const getBatteryLevel = (level?: number) => {
    if (!level) return null

    let color = 'text-green-500'
    if (level < 20) color = 'text-red-500'
    else if (level < 50) color = 'text-yellow-500'

    return (
      <div className="flex items-center space-x-1 text-xs text-gray-500">
        <Battery className={cn('h-3 w-3', color)} />
        <span>{level}%</span>
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Vehicle Overview</h3>
          <Truck className="h-5 w-5 text-gray-400" />
        </div>
        <div className="text-center py-8">
          <Truck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles</h3>
          <p className="mt-1 text-sm text-gray-500">Add vehicles to start tracking deliveries.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Vehicle Overview</h3>
        <div className="flex items-center space-x-2">
          <Truck className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-500">{vehicles.length} vehicles</span>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-3 py-1 text-xs font-medium rounded-full border transition-colors duration-150',
            filter === 'all'
              ? 'bg-blue-100 text-blue-700 border-blue-200'
              : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
          )}
        >
          All ({vehicles.length})
        </button>
        {Object.entries(statusConfig).map(([status, config]) => (
          <button
            key={status}
            onClick={() => setFilter(status as Vehicle['status'])}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-full border transition-colors duration-150 flex items-center space-x-1',
              filter === status
                ? config.color
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            )}
          >
            <config.icon className="h-3 w-3" />
            <span>
              {config.label} ({statusCounts[status as Vehicle['status']] || 0})
            </span>
          </button>
        ))}
      </div>

      {/* Vehicles List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-150"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {vehicle.vehicleNumber}
                  </h4>
                  {getStatusBadge(vehicle.status)}
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  {vehicle.driverName && (
                    <span className="truncate">Driver: {vehicle.driverName}</span>
                  )}
                  
                  {vehicle.currentLocation && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>Tracking</span>
                    </div>
                  )}
                  
                  <span>{formatLastUpdate(vehicle.lastUpdate)}</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 ml-3">
              {getBatteryLevel(vehicle.batteryLevel)}
            </div>
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-6">
          <Truck className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">No vehicles match the selected filter.</p>
        </div>
      )}

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {statusCounts.active || 0}
            </div>
            <div className="text-gray-500">Active</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-yellow-600">
              {statusCounts.idle || 0}
            </div>
            <div className="text-gray-500">Available</div>
          </div>
        </div>
      </div>
    </div>
  )
}