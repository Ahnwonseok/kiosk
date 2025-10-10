import axiosInstance from './axiosInstance';
import { CategoryInfo, ProductInfo } from 'pages/types';

export async function fetchCategoriesWithProducts(): Promise<CategoryInfo[]> {
  const response = await axiosInstance.get<CategoryInfo[]>('api/products');
  return response.data;
}

export async function createCategory(categoryName: string): Promise<CategoryInfo> {
  const response = await axiosInstance.post<CategoryInfo>('api/categories', { categoryName });
  return response.data;
}

export async function updateCategory(categoryId: number, categoryName: string): Promise<void> {
  await axiosInstance.put(`api/categories/${categoryId}`, { categoryName });
}

export async function deleteCategory(categoryId: number): Promise<void> {
  await axiosInstance.delete(`api/categories/${categoryId}`);
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
  const response = await axiosInstance.post<ProductInfo>('api/products', payload);
  return response.data;
}

export type UpdateProductPayload = {
  name?: string;
  price?: number;
  imgUrl?: string;
  hasHot?: boolean;
  hasIce?: boolean;
};

export async function updateProduct(productId: number, payload: UpdateProductPayload): Promise<void> {
  await axiosInstance.put(`api/products/${productId}`, payload);
}

export async function deleteProduct(productId: number): Promise<void> {
  await axiosInstance.delete(`api/products/${productId}`);
}

// Upload an image file and return web path from backend
export async function uploadProductImage(file: File): Promise<{ path: string }> {
  const formData = new FormData();
  formData.append('file', file, file.name);
  
  const response = await axiosInstance.post<{ path: string }>('api/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
}

