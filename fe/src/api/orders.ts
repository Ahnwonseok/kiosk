import { BASE_API_DOMAIN } from './index';
import { OrderData, ManagedOrder, OrderStatusUpdate, ApiResponse, BackendOrderResponse } from './types';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const fetchJSON = async (url: URL, option?: RequestInit) => {
  const response = await fetch(url, {
    ...option,
    headers: {
      ...getAuthHeaders(),
      ...(option?.headers || {})
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
  }

  return response.json();
};

// 현재 백엔드가 프론트 스키마와 동일한 형태를 반환하므로 추가 변환 불필요

// 주문 목록 조회
export const fetchOrders = async (): Promise<ManagedOrder[]> => {
  try {
    const url = new URL('api/orders', BASE_API_DOMAIN);
    const backendOrders: BackendOrderResponse[] = await fetchJSON(url);
    
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
    const url = new URL('api/orders', BASE_API_DOMAIN);
    console.log('🔍 createOrder 요청:', orderData);
    
    const backendResponse = await fetchJSON(url, {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    
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
    const url = new URL(`api/orders/${orderId}/status`, BASE_API_DOMAIN);
    // 백엔드가 @RequestParam OrderStatus status 를 요구하므로 쿼리 파라미터로 전달
    url.searchParams.set('status', statusUpdate.status);
    await fetchJSON(url, {
      method: 'PUT'
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
    const url = new URL(`api/orders/${orderId}`, BASE_API_DOMAIN);
    await fetchJSON(url, {
      method: 'DELETE'
    });
    
    return { success: true };
  } catch (error) {
    console.error('주문 삭제 실패:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '주문 삭제에 실패했습니다.' 
    };
  }
}; 