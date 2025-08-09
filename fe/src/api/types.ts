import { ProductOrder } from 'pages/types';

// 주문 관련 타입
export interface OrderData {
  orderItems: ProductOrder[];
  totalPrice: number;
}

export interface ManagedOrder {
  orderId: string;
  orderNumber: string;
  orderTime: string;
  orderItems: ProductOrder[];
  status: 'waiting' | 'processing' | 'completed';
  totalPrice: number;
}

// 백엔드가 이미 프론트에서 사용하는 스키마로 응답하므로 같은 타입으로 정의
export type BackendOrderResponse = ManagedOrder;

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