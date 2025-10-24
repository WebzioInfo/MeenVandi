import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
}

export const getLoadingText = (context: string) => {
  const texts: Record<string, string> = {
    default: 'Loading...',
    users: 'Loading users...',
    vehicles: 'Loading vehicles...',
    orders: 'Loading orders...',
    routes: 'Loading routes...',
    payments: 'Loading payments...',
    inventory: 'Loading inventory...',
    dashboard: 'Loading dashboard...',
  }
  return texts[context] || texts.default
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getStatusColor(status: string): string {
  const statusColors: { [key: string]: string } = {
    // Vehicle status
    'online': 'bg-green-100 text-green-800',
    'offline': 'bg-gray-100 text-gray-800',
    'on_route': 'bg-blue-100 text-blue-800',
    'at_spot': 'bg-purple-100 text-purple-800',
    'maintenance': 'bg-orange-100 text-orange-800',
    
    // Order status
    'pending': 'bg-yellow-100 text-yellow-800',
    'confirmed': 'bg-blue-100 text-blue-800',
    'preparing': 'bg-indigo-100 text-indigo-800',
    'ready': 'bg-green-100 text-green-800',
    'on_the_way': 'bg-purple-100 text-purple-800',
    'arrived': 'bg-teal-100 text-teal-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    
    // Payment status
    'paid': 'bg-green-100 text-green-800',
    'failed': 'bg-red-100 text-red-800',
    'refunded': 'bg-orange-100 text-orange-800',
    
    // Stop status
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}