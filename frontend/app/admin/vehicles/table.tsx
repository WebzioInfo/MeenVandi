'use client'

import { useState } from 'react'
import { Edit, Trash2, MoreVertical, Truck, MapPin, Battery, Wifi, WifiOff, Clock, AlertTriangle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu'
import { Skeleton } from '@/app/components/ui/loading-spinner'
import { cn } from '@/app/lib/utils'

interface Vehicle {
  id: string
  vehicleNumber: string
  driverName?: string
  type?: string
  status: 'active' | 'idle' | 'maintenance' | 'offline'
  currentLocation?: {
    lat: number
    lng: number
  }
  lastUpdate: string
  batteryLevel?: number
  capacity?: number
  currentRoute?: string
  isOnline?: boolean
}

interface VehiclesTableProps {
  vehicles: Vehicle[]
  loading: boolean
  onEdit: (vehicle: Vehicle) => void
  onDelete: (id: string) => void
  onViewDetails?: (vehicle: Vehicle) => void
  isDeleting?: boolean
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

const vehicleTypeConfig = {
  bike: { label: 'Bike', color: 'bg-blue-100 text-blue-800' },
  car: { label: 'Car', color: 'bg-green-100 text-green-800' },
  truck: { label: 'Truck', color: 'bg-orange-100 text-orange-800' },
  van: { label: 'Van', color: 'bg-purple-100 text-purple-800' },
  default: { label: 'Vehicle', color: 'bg-gray-100 text-gray-800' },
}

export function VehiclesTable({ 
  vehicles, 
  loading, 
  onEdit, 
  onDelete, 
  onViewDetails,
  isDeleting 
}: VehiclesTableProps) {
  const [sortField, setSortField] = useState<'vehicleNumber' | 'status' | 'lastUpdate'>('vehicleNumber')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="space-y-2 flex-1">
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </div>
            <Skeleton variant="text" width="80px" />
            <Skeleton variant="text" width="60px" />
            <Skeleton variant="text" width="40px" />
          </div>
        ))}
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <Truck className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding your first vehicle.</p>
      </div>
    )
  }

  const sortedVehicles = [...vehicles].sort((a, b) => {
    if (sortField === 'lastUpdate') {
      const aTime = new Date(a.lastUpdate).getTime()
      const bTime = new Date(b.lastUpdate).getTime()
      return sortDirection === 'asc' ? aTime - bTime : bTime - aTime
    }

    const aValue = String(a[sortField] ?? '')
    const bValue = String(b[sortField] ?? '')

    return sortDirection === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue)
  })

  const handleSort = (field: 'vehicleNumber' | 'status' | 'lastUpdate') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getStatusBadge = (status: Vehicle['status']) => {
    const config = statusConfig[status]
    const Icon = config.icon
    
    return (
      <span className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.color
      )}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    )
  }

  const getVehicleTypeBadge = (type?: string) => {
    const config = vehicleTypeConfig[type as keyof typeof vehicleTypeConfig] || vehicleTypeConfig.default
    
    return (
      <span className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium',
        config.color
      )}>
        {config.label}
      </span>
    )
  }

  const getBatteryLevel = (level?: number) => {
    if (!level) return null

    let color = 'text-green-500'
    if (level < 20) color = 'text-red-500'
    else if (level < 50) color = 'text-yellow-500'

    return (
      <div className="flex items-center space-x-1 text-xs">
        <Battery className={cn('h-4 w-4', color)} />
        <span className={cn('font-medium', color)}>{level}%</span>
      </div>
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
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const SortButton = ({ field, children }: { field: 'vehicleNumber' | 'status' | 'lastUpdate', children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-gray-700"
    >
      <span>{children}</span>
      {sortField === field && (
        <span className="text-xs">
          {sortDirection === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  )

  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="vehicleNumber">
                Vehicle
              </SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="status">
                Status
              </SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Driver
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Battery
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="lastUpdate">
                Last Update
              </SortButton>
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedVehicles.map((vehicle) => (
            <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {vehicle.vehicleNumber}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      {vehicle.currentLocation && (
                        <>
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>Tracking</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                {getVehicleTypeBadge(vehicle.type)}
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(vehicle.status)}
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {vehicle.driverName || (
                    <span className="text-gray-400">No driver</span>
                  )}
                </div>
                {vehicle.capacity && (
                  <div className="text-xs text-gray-500">
                    Capacity: {vehicle.capacity}kg
                  </div>
                )}
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                {getBatteryLevel(vehicle.batteryLevel)}
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatLastUpdate(vehicle.lastUpdate)}
                </div>
                {vehicle.currentRoute && (
                  <div className="text-xs text-gray-500">
                    Route: {vehicle.currentRoute}
                  </div>
                )}
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-150">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onViewDetails && (
                      <DropdownMenuItem onClick={() => onViewDetails(vehicle)}>
                        <Truck className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onEdit(vehicle)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Vehicle
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(vehicle.id)}
                      disabled={isDeleting}
                      variant="destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting ? 'Deleting...' : 'Delete Vehicle'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Table Summary */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {sortedVehicles.length} of {vehicles.length} vehicles
          </span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Active: {vehicles.filter(v => v.status === 'active').length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Idle: {vehicles.filter(v => v.status === 'idle').length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Maintenance: {vehicles.filter(v => v.status === 'maintenance').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}