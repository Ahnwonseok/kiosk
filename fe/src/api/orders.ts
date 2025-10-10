import axiosInstance from './axiosInstance';
import { OrderData, ManagedOrder, OrderStatusUpdate, ApiResponse, BackendOrderResponse } from './types';

// 주문 목록 조회
export const fetchOrders = async (): Promise<ManagedOrder[]> => {
  try {
    const response = await axiosInstance.get<BackendOrderResponse[]>('api/orders');
    const backendOrders = response.data;
    
    console.log('🔍 백엔드 주문 데이터:', backendOrders);
    
    // 백엔드에서 이미 ManagedOrder 형태를 반환
    return backendOrders as ManagedOrder[];
  } catch (error) {
    console.error('주문 목록 조회 실패:', error);
    throw new Error('주문 목록을 불러오는데 실패했습니다.');
  }
};

// 새 주문 생성
export const createOrder = async (orderData: OrderData): Promise<ApiResponse<ManagedOrder>> => {
  try {
    console.log('🔍 createOrder 요청:', orderData);
    
    const response = await axiosInstance.post<BackendOrderResponse>('api/orders', orderData);
    const backendResponse = response.data;
    
    console.log('🔍 createOrder 백엔드 응답:', backendResponse);
    
    // 백엔드에서 이미 ManagedOrder 형태를 반환
    return { success: true, data: backendResponse as ManagedOrder };
  } catch (error) {
    console.error('주문 등록 실패:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '주문 등록에 실패했습니다.' 
    };
  }
};

// 주문 상태 변경
export const updateOrderStatus = async (
  orderId: string, 
  statusUpdate: OrderStatusUpdate
): Promise<ApiResponse<void>> => {
  try {
    // 백엔드가 @RequestParam OrderStatus status 를 요구하므로 쿼리 파라미터로 전달
    await axiosInstance.put(`api/orders/${orderId}/status`, null, {
      params: { status: statusUpdate.status }
    });
    
    return { success: true };
  } catch (error) {
    console.error('주문 상태 변경 실패:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '주문 상태 변경에 실패했습니다.' 
    };
  }
};

// 주문 삭제
export const deleteOrder = async (orderId: string): Promise<ApiResponse<void>> => {
  try {
    await axiosInstance.delete(`api/orders/${orderId}`);
    
    return { success: true };
  } catch (error) {
    console.error('주문 삭제 실패:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '주문 삭제에 실패했습니다.' 
    };
  }
}; 