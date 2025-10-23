import { create } from 'zustand';
import { Order, OrderStatus } from '../types/order';
import { PaymentStatus } from '../types/payment';
import { api } from '../lib/api';

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;

  // Actions
  setOrders: (orders: Order[]) => void;
  setLoading: (loading: boolean) => void;
  selectOrder: (order: Order | null) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: PaymentStatus) => void;
  fetchOrders: () => Promise<void>;
  fetchUserOrders: (userId: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  loading: false,

  setOrders: (ordersInput: any) => {
    const normalized = Array.isArray(ordersInput)
      ? ordersInput
      : (Array.isArray(ordersInput?.data) ? ordersInput.data : []);
    set({ orders: normalized });
  },

  setLoading: (loading: boolean) => set({ loading }),
  selectOrder: (order: Order | null) => set({ selectedOrder: order }),

  addOrder: (order: Order) => {
    const { orders } = get();
    set({ orders: [order, ...orders] });
  },

  updateOrder: (orderId: string, updates: Partial<Order>) => {
    const { orders } = get();
    set({ orders: orders.map(o => o.id === orderId ? { ...o, ...updates } : o) });
  },

  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    const { orders } = get();
    set({ orders: orders.map(o => o.id === orderId ? { ...o, status } : o) });
  },

  updatePaymentStatus: (orderId: string, paymentStatus: PaymentStatus) => {
    const { orders } = get();
    set({ orders: orders.map(o => o.id === orderId ? { ...o, payment_status: paymentStatus } : o) });
  },

  fetchOrders: async () => {
    set({ loading: true });
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/orders`);
      const orders = Array.isArray(response.data)
        ? response.data
        : (Array.isArray(response.data?.data) ? response.data.data : []);
      set({ orders, loading: false });
    } catch (error) {
      console.error('Error fetching orders:', error);
      set({ loading: false });
    }
  },

  fetchUserOrders: async (userId: string) => {
    set({ loading: true });
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/orders/user/${userId}`);
      const orders = Array.isArray(response.data)
        ? response.data
        : (Array.isArray(response.data?.data) ? response.data.data : []);
      set({ orders, loading: false });
    } catch (error) {
      console.error('Error fetching user orders:', error);
      set({ loading: false });
    }
  },
}));
