export const Constants = {
  ROLES: {
    SUPER_ADMIN: 'super_admin',
    STAFF: 'staff',
    DELIVERY_PARTNER: 'delivery_partner',
    FRANCHISE_OWNER: 'franchise_owner',
    CUSTOMER: 'customer',
  },
  
  VEHICLE_TYPES: {
    GOODS_APE: 'goods_ape',
    BIKE: 'bike',
  },

  VEHICLE_STATUS: {
    ONLINE: 'online',
    OFFLINE: 'offline',
    ON_ROUTE: 'on_route',
    AT_SPOT: 'at_spot',
    MAINTENANCE: 'maintenance',
  },

  ORDER_TYPES: {
    PRE_BOOK: 'pre_book',
    ON_THE_SPOT: 'on_the_spot',
    DOORSTEP: 'doorstep',
  },

  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    ON_THE_WAY: 'on_the_way',
    ARRIVED: 'arrived',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },

  PAYMENT_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },

  PAYMENT_METHODS: {
    CASH: 'cash',
    UPI: 'upi',
    CARD: 'card',
    WALLET: 'wallet',
  },
};