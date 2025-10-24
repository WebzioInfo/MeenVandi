import { useEffect } from 'react';
import { useOrderStore } from '@/app/store/order-store';
import { useAuth } from '@/app/contexts/AuthContext';

export const useOrders = () => {
  const { user } = useAuth();
  const { 
    orders, 
    loading,
    fetchOrders,
    fetchUserOrders 
  } = useOrderStore();

  useEffect(() => {
    if (user) {
      if (user.role === 'customer') {
        fetchUserOrders(user.id);
      } else {
        fetchOrders();
      }
    }
  }, [user, fetchOrders, fetchUserOrders]);

  const getOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  const getPendingOrders = () => {
    return orders.filter(order => 
      order.status === 'pending' || order.status === 'confirmed'
    );
  };

  return {
    orders,
    loading,
    getOrdersByStatus,
    getPendingOrders,
    refreshOrders: user?.role === 'customer' ? () => fetchUserOrders(user.id) : fetchOrders,
  };
};