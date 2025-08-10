import { CategoryInfo, OrderResult, OrderSuccessInfo, ProductOrder } from 'pages/types';
import { formatMenuOptionOrderList } from 'utils';

//export const BASE_API_DOMAIN = new URL(`http://localhost:8081`);
export const BASE_API_DOMAIN = new URL(`http://1.235.32.57:8081`);
//export const BASE_API_DOMAIN = new URL(`http://192.168.123.101:8081`);
//const BASE_API_DOMAIN = new URL(`http://182.229.16.44:8081`);
//const BASE_API_DOMAIN = new URL(`http://192.168.0.42:8081`);

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt');
  console.log('🔍 JWT Token Check:', token ? `Token exists (${token.substring(0, 20)}...)` : 'No token found');
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
    throw new Error(response.statusText);
  }

  return response.json();
};

let menusFetchPromise: Promise<CategoryInfo[] | undefined> | null = null;

export const fetchMenus = async (): Promise<CategoryInfo[] | undefined> => {
  if (menusFetchPromise) {
    return menusFetchPromise;
  }

  menusFetchPromise = (async () => {
    try {
      const url = new URL('api/products', BASE_API_DOMAIN);
      const result = await fetchJSON(url);
      menusFetchPromise = null; // 성공적인 응답 후 초기화
      return result;
    } catch (error) {
      console.error(error);
      menusFetchPromise = null; // 에러 발생 시 초기화
      return undefined;
    }
  })();

  return menusFetchPromise;
};

export const requestCardOrder = async (
  orderList: ProductOrder[],
  totalPrice: number
): Promise<OrderResult | undefined> => {
  const formattedOrderList = formatMenuOptionOrderList(orderList);
  const json = JSON.stringify({
    orderProducts: formattedOrderList,
    totalPrice: totalPrice,
  });
  const option = {
    method: 'POST',
    body: json,
  };

  try {
    const url = new URL('api/payment/card', BASE_API_DOMAIN);
    return await fetchJSON(url, option);
  } catch (error) {
    console.error(error);
  }
};

let receiptFetchPromise: { [key: number]: Promise<OrderSuccessInfo | undefined> } = {};

export const fetchReceipt = async (orderId: number): Promise<OrderSuccessInfo | undefined> => {
  if (orderId in receiptFetchPromise) {
    return receiptFetchPromise[orderId];
  }

  receiptFetchPromise[orderId] = (async () => {
    try {
      const url = new URL(`api/receipt?orderId=${orderId}`, BASE_API_DOMAIN);
      return await fetchJSON(url);
    } catch (error) {
      console.error(error);
      return undefined;
    }
  })();

  return receiptFetchPromise[orderId];
};

export const requestCashOrder = async (
  orderList: ProductOrder[],
  totalPrice: number,
  receivedPrice: number
): Promise<OrderResult | undefined> => {
  const formattedOrderList = formatMenuOptionOrderList(orderList);
  const json = JSON.stringify({
    orderProducts: formattedOrderList,
    totalPrice: totalPrice,
    receivedPrice: receivedPrice,
  });
  const option = {
    method: 'POST',
    body: json,
  };

  try {
    const url = new URL('api/payment/cash', BASE_API_DOMAIN);
    return await fetchJSON(url, option);
  } catch (error) {
    console.error(error);
  }
};

export const failCardOrder = async (
  orderList: ProductOrder[],
  totalPrice: number
): Promise<OrderResult | undefined> => {
  const formattedOrderList = formatMenuOptionOrderList(orderList);
  const json = JSON.stringify({
    orderItems: formattedOrderList,
    totalPrice: totalPrice,
  });
  const option = {
    method: 'POST',
    body: json,
  };

  try {
    const url = new URL('api/payment/card?fail=500', BASE_API_DOMAIN);
    return await fetchJSON(url, option);
  } catch (error) {
    console.error(error);
  }
};

export async function login(username: string, password: string) {
  const response = await fetch(BASE_API_DOMAIN+'api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error('로그인 실패');
  return response.json();
}

// 새로운 API 모듈들 export
export * from './orders';
export * from './types';
export * from './menu';