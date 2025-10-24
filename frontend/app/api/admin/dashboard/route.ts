import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/app/lib/api'

export async function GET(request: NextRequest) {
  try {
    // Fetch data from multiple endpoints
    const [usersRes, vehiclesRes, ordersRes, paymentsRes] = await Promise.all([
      api.get('/users'),
      api.get('/vehicles'),
      api.get('/orders'),
      api.get('/payments/stats')
    ])

    const users = usersRes.data
    const vehicles = vehiclesRes.data
    const orders = ordersRes.data
    const paymentStats = paymentsRes.data

    // Calculate stats
    const stats = {
      totalUsers: users.length,
      totalVehicles: vehicles.length,
      totalOrders: orders.length,
      totalRevenue: paymentStats.totalRevenue || 0,
      activeVehicles: vehicles.filter((v: any) => v.status === 'active').length,
      pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
      completedOrders: orders.filter((o: any) => o.status === 'delivered').length,
    }

    // Recent activities
    const recentActivities = orders
      .slice(0, 10)
      .map((order: any) => ({
        id: order.id,
        type: 'order_created',
        description: `New order ${order.orderNumber} created`,
        timestamp: order.createdAt,
        user: order.customerName || 'Customer',
      }))

    return NextResponse.json({
      stats,
      orders: {
        daily: orders.filter((o: any) => 
          new Date(o.createdAt).toDateString() === new Date().toDateString()
        ).length,
        weekly: orders.filter((o: any) => {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return new Date(o.createdAt) > weekAgo
        }).length,
        monthly: orders.filter((o: any) => {
          const monthAgo = new Date()
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return new Date(o.createdAt) > monthAgo
        }).length,
        completed: stats.completedOrders,
        pending: stats.pendingOrders,
      },
      vehicles: vehicles.map((vehicle: any) => ({
        id: vehicle.id,
        vehicleNumber: vehicle.vehicleNumber,
        driverName: vehicle.driverName,
        status: vehicle.status,
        currentLocation: vehicle.currentLocation,
        lastUpdate: vehicle.updatedAt,
      })),
      recentActivities,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}