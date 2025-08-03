import { ProductOrder } from 'pages/types';

// 백엔드 응답 타입 (실제 받아오는 데이터)
export interface BackendOrderResponse {
  id: number;
  orderNumber: number;
  orderDatetime: string;
  orderStatus: string;
}

// 주문 관련 타입
export interface OrderData {
  orderItems: ProductOrder[];
  totalPrice: number;
}

export interface ManagedOrder {
  orderId: string;
  orderTime: string;
  orderItems: ProductOrder[];
  status: 'waiting' | 'processing' | 'completed';
  totalPrice: number;
}

export interface OrderStatusUpdate {
  status: 'waiting' | 'processing' | 'completed';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 실시간 업데이트 이벤트 타입
export interface OrderEvent {
  type: 'NEW_ORDER' | 'STATUS_CHANGE' | 'ORDER_DELETED';
  orderId?: string;
  order?: ManagedOrder;
  status?: string;
} 