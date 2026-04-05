import axios from 'axios';

export interface Item {
  category: 'auto' | 'real_estate' | 'electronics';
  title: string;
  price: number;
  needsRevision: boolean;
  id: number;
}

export interface ItemsResponse {
  items: Item[];
  total: number;
}

export interface ItemDetailResponse extends Item {
  description: string;
  createdAt: string;
  updatedAt: string;
  params: Record<string, string | number | undefined>;
}

export type ItemUpdateIn = {
  category: 'auto' | 'real_estate' | 'electronics';
  title: string;
  description?: string;
  price: number;
  params: AutoItemParams | RealEstateItemParams | ElectronicsItemParams;
};

export type AutoItemParams = {
  brand?: string;
  model?: string;
  yearOfManufacture?: number;
  transmission?: 'automatic' | 'manual';
  mileage?: number;
  enginePower?: number;
};

export type RealEstateItemParams = {
  type?: 'flat' | 'house' | 'room';
  address?: string;
  area?: number;
  floor?: number;
};

export type ElectronicsItemParams = {
  type?: 'phone' | 'laptop' | 'misc';
  brand?: string;
  model?: string;
  condition?: 'new' | 'used';
  color?: string;
};

export const getAllItems = async (params: {
  q?: string;
  limit?: number;
  skip?: number;
  needsRevision?: boolean;
  categories?: string;
  sortColumn?: 'title' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
} = {}): Promise<ItemsResponse> => {
  const { data } = await axios.get<ItemsResponse>('/items', { params });
  return data;
};

export const getItemById = async (id: string | number): Promise<ItemDetailResponse> => {
  const { data } = await axios.get<ItemDetailResponse>(`/items/${id}`);
  return data;
};

export const updateItem = async (
  id: string | number,
  data: ItemUpdateIn
): Promise<ItemDetailResponse> => {
  const { data: response } = await axios.put<ItemDetailResponse>(`/items/${id}`, data);
  return response;
};