import { BASE_API_DOMAIN } from './index';
import { CategoryInfo, ProductInfo } from 'pages/types';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const fetchJSON = async (url: URL, option?: RequestInit) => {
  const response = await fetch(url, {
    ...option,
    headers: { ...getAuthHeaders(), ...(option?.headers || {}) },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
  }
  return response.json();
};

export async function fetchCategoriesWithProducts(): Promise<CategoryInfo[]> {
  const url = new URL('api/products', BASE_API_DOMAIN);
  return await fetchJSON(url);
}

export async function createCategory(categoryName: string): Promise<CategoryInfo> {
  const url = new URL('api/categories', BASE_API_DOMAIN);
  return await fetchJSON(url, { method: 'POST', body: JSON.stringify({ categoryName }) });
}

export async function updateCategory(categoryId: number, categoryName: string): Promise<void> {
  const url = new URL(`api/categories/${categoryId}`, BASE_API_DOMAIN);
  await fetchJSON(url, { method: 'PUT', body: JSON.stringify({ categoryName }) });
}

export async function deleteCategory(categoryId: number): Promise<void> {
  const url = new URL(`api/categories/${categoryId}`, BASE_API_DOMAIN);
  await fetchJSON(url, { method: 'DELETE' });
}

export type CreateProductPayload = {
  categoryId: number;
  name: string;
  price: number;
  imgUrl: string;
  hasHot: boolean;
  hasIce: boolean;
};

export async function createProduct(payload: CreateProductPayload): Promise<ProductInfo> {
  const url = new URL('api/products', BASE_API_DOMAIN);
  return await fetchJSON(url, { method: 'POST', body: JSON.stringify(payload) });
}

export type UpdateProductPayload = {
  name?: string;
  price?: number;
  imgUrl?: string;
  hasHot?: boolean;
  hasIce?: boolean;
};

export async function updateProduct(productId: number, payload: UpdateProductPayload): Promise<void> {
  const url = new URL(`api/products/${productId}`, BASE_API_DOMAIN);
  await fetchJSON(url, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteProduct(productId: number): Promise<void> {
  const url = new URL(`api/products/${productId}`, BASE_API_DOMAIN);
  await fetchJSON(url, { method: 'DELETE' });
}

// Upload an image file and return web path from backend
export async function uploadProductImage(file: File): Promise<{ path: string }> {
  const url = new URL('api/uploads', BASE_API_DOMAIN);
  const token = localStorage.getItem('jwt');
  const formData = new FormData();
  formData.append('file', file, file.name);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || '이미지 업로드 실패');
  }
  return res.json();
}

