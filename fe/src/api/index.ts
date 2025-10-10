import axiosInstance from './axiosInstance';
import { CategoryInfo, OrderResult, OrderSuccessInfo, ProductOrder } from 'pages/types';
import { formatMenuOptionOrderList } from 'utils';

// BASE_API_DOMAIN은 config.ts로 이동
export { BASE_API_DOMAIN } from './config';

let menusFetchPromise: Promise<CategoryInfo[] | undefined> | null = null;

export const fetchMenus = async (): Promise<CategoryInfo[] | undefined> => {
  if (menusFetchPromise) {
    return menusFetchPromise;
  }

  menusFetchPromise = (async () => {
    try {
      const response = await axiosInstance.get<CategoryInfo[]>('api/products');
      menusFetchPromise = null; // 성공적인 응답 후 초기화
      return response.data;
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
  const payload = {
    orderProducts: formattedOrderList,
    totalPrice: totalPrice,
  };

  try {
    const response = await axiosInstance.post<OrderResult>('api/payment/card', payload);
    return response.data;
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
      const response = await axiosInstance.get<OrderSuccessInfo>('api/receipt', {
        params: { orderId }
      });
      return response.data;
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
  const payload = {
    orderProducts: formattedOrderList,
    totalPrice: totalPrice,
    receivedPrice: receivedPrice,
  };

  try {
    const response = await axiosInstance.post<OrderResult>('api/payment/cash', payload);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const failCardOrder = async (
  orderList: ProductOrder[],
  totalPrice: number
): Promise<OrderResult | undefined> => {
  const formattedOrderList = formatMenuOptionOrderList(orderList);
  const payload = {
    orderItems: formattedOrderList,
    totalPrice: totalPrice,
  };

  try {
    const response = await axiosInstance.post<OrderResult>('api/payment/card', payload, {
      params: { fail: 500 }
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export async function login(username: string, password: string) {
  try {
    const response = await axiosInstance.post('api/auth/login', { username, password });
    return response.data;
  } catch (error) {
    throw new Error('로그인 실패');
  }
}

// 새로운 API 모듈들 export
export * from './orders';
export * from './types';
export * from './menu';