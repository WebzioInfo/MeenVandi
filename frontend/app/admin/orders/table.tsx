'use client'

import { useState } from 'react'
import { Eye, Edit, Trash2, MoreVertical, Package, MapPin, User, Clock, CheckCircle, XCircle, AlertCircle, Truck } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu'
import { Skeleton } from '@/app/components/ui/loading-spinner'
import { cn } from '@/app/lib/utils'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'in_transit' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  totalAmount: number
  deliveryAddress: string
  deliveryInstructions?: string
  assignedVehicle?: string
  assignedDriver?: string
  createdAt: string
  updatedAt: string
  estimatedDelivery?: string
  actualDelivery?: string
  items?: OrderItem[]
}

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  total: number
}

interface OrdersTableProps {
  orders: Order[]
  loading: boolean
  onEdit: (order: Order) => void
  onDelete: (id: string) => void
  onViewDetails?: (order: Order) => void
  onUpdateStatus?: (id: string, status: Order['status']) => void
  isDeleting?: boolean
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    icon: CheckCircle,
  },
  preparing: {
    label: 'Preparing',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    icon: Package,
  },
  ready: {
    label: 'Ready',
    color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    icon: CheckCircle,
  },
  in_transit: {
    label: 'In Transit',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-600 bg-green-50 border-green-200',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600 bg-red-50 border-red-200',
    icon: XCircle,
  },
}

const paymentStatusConfig = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-600 bg-yellow-50',
  },
  paid: {
    label: 'Paid',
    color: 'text-green-600 bg-green-50',
  },
  failed: {
    label: 'Failed',
    color: 'text-red-600 bg-red-50',
  },
  refunded: {
    label: 'Refunded',
    color: 'text-gray-600 bg-gray-50',
  },
}

export function OrdersTable({ 
  orders, 
  loading, 
  onEdit, 
  onDelete, 
  onViewDetails,
  onUpdateStatus,
  isDeleting 
}: OrdersTableProps) {
const [sortField, setSortField] = useState<'orderNumber' | 'status' | 'totalAmount' | 'createdAt' | 'updatedAt'>('orderNumber')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

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
            <Skeleton variant="text" width="100px" />
            <Skeleton variant="text" width="80px" />
            <Skeleton variant="text" width="60px" />
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {orders.length === 0 ? 'No orders have been placed yet.' : 'No orders match your search criteria.'}
        </p>
      </div>
    )
  }

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortField === 'createdAt' || sortField === 'updatedAt') {
      const aTime = new Date(a[sortField]).getTime()
      const bTime = new Date(b[sortField]).getTime()
      return sortDirection === 'asc' ? aTime - bTime : bTime - aTime
    }

    if (sortField === 'totalAmount') {
      return sortDirection === 'asc' ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount
    }

    const aValue = String(a[sortField] ?? '')
    const bValue = String(b[sortField] ?? '')

    return sortDirection === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue)
  })

  const handleSort = (field: 'orderNumber' | 'status' | 'createdAt' | 'totalAmount') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getStatusBadge = (status: Order['status']) => {
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

  const getPaymentStatusBadge = (status: Order['paymentStatus']) => {
    const config = paymentStatusConfig[status]
    
    return (
      <span className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium',
        config.color
      )}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return 'Invalid date'
    }
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid time'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    const statusFlow: Record<Order['status'], Order['status'] | null> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'in_transit',
      in_transit: 'delivered',
      delivered: null,
      cancelled: null,
    }
    return statusFlow[currentStatus]
  }

  const SortButton = ({ field, children }: { field: 'orderNumber' | 'status' | 'createdAt' | 'totalAmount', children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-gray-700 transition-colors duration-150"
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
              <SortButton field="orderNumber">
                Order Details
              </SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="status">
                Status
              </SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="totalAmount">
                Amount
              </SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="createdAt">
                Created
              </SortButton>
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedOrders.map((order) => {
            const nextStatus = getNextStatus(order.status)
            
            return (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate max-w-[200px]">
                          {order.deliveryAddress}
                        </span>
                      </div>
                      {order.assignedDriver && (
                        <div className="text-xs text-gray-400 mt-1">
                          Driver: {order.assignedDriver}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {order.customerName}
                  </div>
                  {order.customerPhone && (
                    <div className="text-sm text-gray-500">
                      {order.customerPhone}
                    </div>
                  )}
                  {order.customerEmail && (
                    <div className="text-xs text-gray-400 truncate max-w-[150px]">
                      {order.customerEmail}
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-2">
                    {getStatusBadge(order.status)}
                    {nextStatus && onUpdateStatus && (
                      <button
                        onClick={() => onUpdateStatus(order.id, nextStatus)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors duration-150"
                      >
                        Mark as {statusConfig[nextStatus].label}
                      </button>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  {getPaymentStatusBadge(order.paymentStatus)}
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </div>
                  {order.items && (
                    <div className="text-xs text-gray-500">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {formatDate(order.createdAt)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(order.createdAt)}
                  </div>
                  {order.estimatedDelivery && (
                    <div className="text-xs text-blue-600 mt-1">
                      Est: {formatDate(order.estimatedDelivery)}
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
                    <DropdownMenuContent align="end" className="w-48">
                      {onViewDetails && (
                        <DropdownMenuItem onClick={() => onViewDetails(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onEdit(order)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Order
                      </DropdownMenuItem>
                      
                      {/* Quick Status Updates */}
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                          {nextStatus && onUpdateStatus && (
                            <DropdownMenuItem onClick={() => onUpdateStatus(order.id, nextStatus)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              Mark as {statusConfig[nextStatus].label}
                            </DropdownMenuItem>
                          )}
                         {(order.status as Order['status']) !== 'cancelled' && (
  <DropdownMenuItem 
    onClick={() => onUpdateStatus?.(order.id, 'cancelled')}
    variant="destructive"
  >
    <XCircle className="mr-2 h-4 w-4" />
    Cancel Order
  </DropdownMenuItem>
)}

                        </>
                      )}
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(order.id)}
                        disabled={isDeleting}
                        variant="destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isDeleting ? 'Deleting...' : 'Delete Order'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Table Summary */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 space-y-2 sm:space-y-0">
          <span>
            Showing {sortedOrders.length} of {orders.length} orders
          </span>
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Pending: {orders.filter(o => o.status === 'pending').length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Confirmed: {orders.filter(o => o.status === 'confirmed').length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Preparing: {orders.filter(o => o.status === 'preparing').length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>In Transit: {orders.filter(o => o.status === 'in_transit').length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Delivered: {orders.filter(o => o.status === 'delivered').length}</span>
            </div>
          </div>
        </div>
        
        {/* Revenue Summary */}
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Revenue:</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>Paid Orders: {orders.filter(o => o.paymentStatus === 'paid').length}</span>
            <span>Pending Payments: {orders.filter(o => o.paymentStatus === 'pending').length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Additional components needed for the dropdown
const DropdownMenuSeparator = ({ className }: { className?: string }) => (
  <div className={cn('-mx-1 my-1 h-px bg-gray-200', className)} />
)

const DropdownMenuLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('px-2 py-1.5 text-sm font-semibold text-gray-700', className)}>
    {children}
  </div>
)