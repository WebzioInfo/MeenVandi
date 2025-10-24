import Link from 'next/link'
import { Plus, Users, Truck, Package, MapPin } from 'lucide-react'

const actions = [
  {
    title: 'Add User',
    description: 'Create new user account',
    icon: Users,
    href: '/admin/users',
    color: 'bg-blue-500',
  },
  {
    title: 'Add Vehicle',
    description: 'Register new delivery vehicle',
    icon: Truck,
    href: '/admin/vehicles',
    color: 'bg-green-500',
  },
  {
    title: 'Create Order',
    description: 'Create new delivery order',
    icon: Package,
    href: '/admin/orders',
    color: 'bg-purple-500',
  },
  {
    title: 'Manage Stops',
    description: 'Add or manage delivery stops',
    icon: MapPin,
    href: '/admin/stops',
    color: 'bg-orange-500',
  },
]

export function QuickActions() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.title}
              href={action.href}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
            >
              <div className={`p-3 rounded-lg ${action.color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-gray-900">{action.title}</h4>
                <p className="text-sm text-gray-500">{action.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}