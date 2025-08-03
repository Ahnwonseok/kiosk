import { BASE_API_DOMAIN } from './index';
import { OrderData, ManagedOrder, OrderStatusUpdate, ApiResponse } from './types';

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

// 주문 목록 조회
export const fetchOrders = async (): Promise<ManagedOrder[]> => {
  try {
    const url = new URL('api/orders', BASE_API_DOMAIN);
    const orders = await fetchJSON(url);
    return orders;
  } catch (error) {
    console.error('주문 목록 조회 실패:', error);
    throw new Error('주문 목록을 불러오는데 실패했습니다.');
  }
};

// 새 주문 생성
export const createOrder = async (orderData: OrderData): Promise<ApiResponse<ManagedOrder>> => {
  try {
    const url = new URL('api/orders', BASE_API_DOMAIN);
    const newOrder = await fetchJSON(url, {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    
    return { success: true, data: newOrder };
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
    await fetchJSON(url, {
      method: 'PUT',
      body: JSON.stringify(statusUpdate)
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