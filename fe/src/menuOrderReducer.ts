import { ProductOrder } from 'pages/types';

export type ActionMap = {
  ADD_ORDER: { newOrder: ProductOrder };
  REMOVE_ORDER: { productId: number; size: string; temperature: string };
  INCREMENT_ORDER: { productId: number; size: string; temperature: string };
  DECREMENT_ORDER: { productId: number; size: string; temperature: string };
  RESET: {};
};

export type MenuOrderAction = {
  [Key in keyof ActionMap]: {
    type: Key;
    payload?: ActionMap[Key];
  };
}[keyof ActionMap];

export default function menuOrderReducer(initialOrders: ProductOrder[], action: MenuOrderAction): ProductOrder[] {
  switch (action.type) {
    case 'ADD_ORDER': {
      if (!action.payload) {
        throw new Error('REMOVE_ORDER action must have payload');
      }
      return [...initialOrders, action.payload.newOrder];
    }
    case 'REMOVE_ORDER': {
      if (!action.payload) {
        throw new Error('REMOVE_ORDER action must have payload');
      }
      const { productId, size, temperature } = action.payload;
      return initialOrders.filter(
        order => order.productId !== productId || order.size !== size || order.temperature !== temperature
      );
    }
    case 'INCREMENT_ORDER': {
      if (!action.payload) {
        throw new Error('INCREMENT_ORDER action must have payload');
      }
      const { productId, size, temperature } = action.payload;
      let incremented = false;
      const updated = initialOrders.map(order => {
        if (!incremented && order.productId === productId && order.size === size && order.temperature === temperature) {
          incremented = true;
          return { ...order, amount: order.amount + 1 };
        }
        return order;
      });
      // If not found, no change
      return updated;
    }
    case 'DECREMENT_ORDER': {
      if (!action.payload) {
        throw new Error('DECREMENT_ORDER action must have payload');
      }
      const { productId, size, temperature } = action.payload;
      let decremented = false;
      const updated = initialOrders.map(order => {
        if (!decremented && order.productId === productId && order.size === size && order.temperature === temperature) {
          decremented = true;
          const newAmount = Math.max(1, order.amount - 1); // never below 1
          return { ...order, amount: newAmount };
        }
        return order;
      });
      return updated;
    }
    case 'RESET': {
      return [];
    }
    default:
      return initialOrders;
  }
}
