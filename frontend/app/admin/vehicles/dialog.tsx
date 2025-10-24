'use client'

import { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription 
} from '@/app/components/ui/dialog'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { AlertCircle, Truck, MapPin, Battery, Wifi } from 'lucide-react'
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
  batteryLevel?: number
  capacity?: number
  model?: string
  year?: number
  color?: string
  insuranceNumber?: string
  registrationDate?: string
}

interface VehicleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: Vehicle
  onSubmit: (vehicleData: any) => void
  loading: boolean
}

const vehicleTypes = [
  { value: 'bike', label: 'Bike' },
  { value: 'car', label: 'Car' },
  { value: 'truck', label: 'Truck' },
  { value: 'van', label: 'Van' },
  { value: 'scooter', label: 'Scooter' },
]

const vehicleStatuses = [
  { value: 'active', label: 'Active', color: 'text-green-600' },
  { value: 'idle', label: 'Idle', color: 'text-yellow-600' },
  { value: 'maintenance', label: 'Maintenance', color: 'text-blue-600' },
  { value: 'offline', label: 'Offline', color: 'text-gray-600' },
]

export function VehicleDialog({ open, onOpenChange, vehicle, onSubmit, loading }: VehicleDialogProps) {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    driverName: '',
    type: 'bike',
    status: 'active' as Vehicle['status'],
    capacity: '',
    model: '',
    year: '',
    color: '',
    insuranceNumber: '',
    registrationDate: '',
    batteryLevel: '',
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (vehicle) {
      setFormData({
        vehicleNumber: vehicle.vehicleNumber || '',
        driverName: vehicle.driverName || '',
        type: vehicle.type || 'bike',
        status: vehicle.status || 'active',
        capacity: vehicle.capacity?.toString() || '',
        model: vehicle.model || '',
        year: vehicle.year?.toString() || '',
        color: vehicle.color || '',
        insuranceNumber: vehicle.insuranceNumber || '',
        registrationDate: vehicle.registrationDate || '',
        batteryLevel: vehicle.batteryLevel?.toString() || '',
      })
    } else {
      setFormData({
        vehicleNumber: '',
        driverName: '',
        type: 'bike',
        status: 'active',
        capacity: '',
        model: '',
        year: '',
        color: '',
        insuranceNumber: '',
        registrationDate: '',
        batteryLevel: '',
      })
    }
    setErrors({})
  }, [vehicle, open])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle number is required'
    }

    if (!formData.driverName.trim()) {
      newErrors.driverName = 'Driver name is required'
    }

    if (formData.capacity && isNaN(Number(formData.capacity))) {
      newErrors.capacity = 'Capacity must be a number'
    }

    if (formData.batteryLevel && (isNaN(Number(formData.batteryLevel)) || Number(formData.batteryLevel) < 0 || Number(formData.batteryLevel) > 100)) {
      newErrors.batteryLevel = 'Battery level must be between 0 and 100'
    }

    if (formData.year && (isNaN(Number(formData.year)) || Number(formData.year) < 1900 || Number(formData.year) > new Date().getFullYear())) {
      newErrors.year = 'Year must be valid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const submitData = {
      vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
      driverName: formData.driverName.trim(),
      type: formData.type,
      status: formData.status,
      ...(formData.capacity && { capacity: Number(formData.capacity) }),
      ...(formData.model && { model: formData.model.trim() }),
      ...(formData.year && { year: Number(formData.year) }),
      ...(formData.color && { color: formData.color.trim() }),
      ...(formData.insuranceNumber && { insuranceNumber: formData.insuranceNumber.trim() }),
      ...(formData.registrationDate && { registrationDate: formData.registrationDate }),
      ...(formData.batteryLevel && { batteryLevel: Number(formData.batteryLevel) }),
    }

    onSubmit(submitData)
  }

  const getStatusConfig = (status: Vehicle['status']) => {
    return vehicleStatuses.find(s => s.value === status) || vehicleStatuses[0]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </DialogTitle>
          <DialogDescription>
            {vehicle 
              ? 'Update vehicle information and status.' 
              : 'Add a new vehicle to your delivery fleet.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Basic Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleNumber" required>
                  Vehicle Number
                </Label>
                <Input
                  id="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  placeholder="e.g., KL07AB1234"
                  className={errors.vehicleNumber ? 'border-red-500' : ''}
                />
                {errors.vehicleNumber && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.vehicleNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="driverName" required>
                  Driver Name
                </Label>
                <Input
                  id="driverName"
                  value={formData.driverName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, driverName: e.target.value })}
                  placeholder="Enter driver name"
                  className={errors.driverName ? 'border-red-500' : ''}
                />
                {errors.driverName && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.driverName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Vehicle Type</Label>
                <select
                  id="type"
                  value={formData.type}
                   onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
    setFormData({ ...formData, type: e.target.value })
  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {vehicleTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (kg)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="e.g., 100"
                  className={errors.capacity ? 'border-red-500' : ''}
                />
                {errors.capacity && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.capacity}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status & Battery */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Status & Battery
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
    setFormData({ ...formData, status: e.target.value as Vehicle['status'] })
  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {vehicleStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Current status: <span className={cn('font-medium', getStatusConfig(formData.status).color)}>
                    {getStatusConfig(formData.status).label}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batteryLevel">
                  <div className="flex items-center gap-2">
                    <Battery className="h-4 w-4" />
                    Battery Level (%)
                  </div>
                </Label>
                <Input
                  id="batteryLevel"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.batteryLevel}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, batteryLevel: e.target.value })}
                  placeholder="0-100"
                  className={errors.batteryLevel ? 'border-red-500' : ''}
                />
                {errors.batteryLevel && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.batteryLevel}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Additional Details
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g., Honda Activa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="e.g., 2023"
                  className={errors.year ? 'border-red-500' : ''}
                />
                {errors.year && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.year}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="e.g., Red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="insuranceNumber">Insurance Number</Label>
                <Input
                  id="insuranceNumber"
                  value={formData.insuranceNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                  placeholder="Insurance policy number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationDate">Registration Date</Label>
              <Input
                id="registrationDate"
                type="date"
                value={formData.registrationDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, registrationDate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {vehicle ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                vehicle ? 'Update Vehicle' : 'Add Vehicle'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}