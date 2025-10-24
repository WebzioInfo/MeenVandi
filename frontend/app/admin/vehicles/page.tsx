'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vehicleAPI } from '@/app/lib/api'
import { Plus, Truck, Search } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { VehiclesTable } from './table'
import { VehicleDialog } from './dialog'

export default function VehiclesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: vehicles, isLoading, error } = useQuery({
    queryKey: ['admin-vehicles'],
    queryFn: () => vehicleAPI.getAll().then((res: any) => res.data),
  })

  const createVehicleMutation = useMutation({
    mutationFn: (vehicleData: any) => vehicleAPI.create(vehicleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] })
      setIsDialogOpen(false)
      setSelectedVehicle(null)
    },
  })

  const updateVehicleMutation = useMutation({
    mutationFn: ({ id, vehicleData }: { id: string; vehicleData: any }) => 
      vehicleAPI.update(id, vehicleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] })
      setIsDialogOpen(false)
      setSelectedVehicle(null)
    },
  })

  const deleteVehicleMutation = useMutation({
    mutationFn: (id: string) => vehicleAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] })
    },
  })

  const filteredVehicles = vehicles?.filter((vehicle: any) => {
    const matchesSearch = vehicle.vehicleNumber?.toLowerCase().includes(search.toLowerCase()) ||
                         vehicle.driverName?.toLowerCase().includes(search.toLowerCase()) ||
                         vehicle.model?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  const handleEdit = (vehicle: any) => {
    setSelectedVehicle(vehicle)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedVehicle(null)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      deleteVehicleMutation.mutate(id)
    }
  }

  const handleViewDetails = (vehicle: any) => {
    // Navigate to vehicle details page or show details modal
    console.log('View details:', vehicle)
    // You can implement a details view or modal here
  }

  const handleSubmit = (vehicleData: any) => {
    if (selectedVehicle) {
      updateVehicleMutation.mutate({ id: selectedVehicle.id, vehicleData })
    } else {
      createVehicleMutation.mutate(vehicleData)
    }
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading vehicles: {(error as Error).message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicles Management</h1>
          <p className="text-gray-600 mt-1">Manage your delivery fleet and vehicle status</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Vehicle</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{vehicles?.length || 0}</p>
            </div>
            <Truck className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {vehicles?.filter((v: any) => v.status === 'active').length || 0}
              </p>
            </div>
            <Truck className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-blue-600">
                {vehicles?.filter((v: any) => v.status === 'maintenance').length || 0}
              </p>
            </div>
            <Truck className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Offline</p>
              <p className="text-2xl font-bold text-gray-600">
                {vehicles?.filter((v: any) => v.status === 'offline').length || 0}
              </p>
            </div>
            <Truck className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search vehicles by number, driver, or model..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="idle">Idle</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <VehiclesTable
          vehicles={filteredVehicles}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
          isDeleting={deleteVehicleMutation.isPending}
        />
      </div>

      {/* Create/Edit Dialog */}
      <VehicleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        vehicle={selectedVehicle}
        onSubmit={handleSubmit}
        loading={createVehicleMutation.isPending || updateVehicleMutation.isPending}
      />
    </div>
  )
}