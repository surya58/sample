// Generated TypeScript types for Product Inventory API
// This file provides complete type definitions for frontend integration

// Base Types
export enum ProductStatus {
  InStock = 0,
  OutOfStock = 1,
  Discontinued = 2,
  PreOrder = 3
}

// Product Models
export interface Product {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  status: ProductStatus;
  description?: string;
  categoryId?: number;
}

export interface ProductItem {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  status: ProductStatus;
  description?: string;
  categoryId?: number;
  categoryName?: string;
}

// Category Models
export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface ProductCategoryItem {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  productCount: number;
}

export interface ProductCategoryDetail {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  products: ProductItem[];
}

// Command Types for Mutations
export interface CreateProductCommand {
  name: string;
  sku: string;
  quantity: number;
  price: number;
  status: ProductStatus;
  description?: string;
  categoryId?: number;
}

export interface UpdateProductCommand {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  status: ProductStatus;
  description?: string;
  categoryId?: number;
}

export interface UpdateInventoryCommand {
  id: number;
  quantity: number;
}

export interface CreateProductCategoryCommand {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateProductCategoryCommand {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

// API Response Types
export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

export type ApiError = {
  message: string;
  status: number;
  details?: any;
};

// RTK Query Hook Types
export type ProductsQueryResult = {
  data?: ProductItem[];
  error?: ApiError;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => void;
};

export type ProductQueryResult = {
  data?: ProductItem;
  error?: ApiError;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => void;
};

export type CategoriesQueryResult = {
  data?: ProductCategoryItem[];
  error?: ApiError;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => void;
};

export type CategoryQueryResult = {
  data?: ProductCategoryDetail;
  error?: ApiError;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => void;
};

// Mutation Result Types
export type MutationResult<T = any> = {
  data?: T;
  error?: ApiError;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
};

// Filter and Search Types
export interface ProductFilters {
  categoryId?: number;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  inStock?: boolean;
}

export interface CategoryFilters {
  isActive?: boolean;
  hasProducts?: boolean;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Form Types for UI Components
export interface ProductFormData {
  name: string;
  sku: string;
  quantity: number;
  price: number;
  status: ProductStatus;
  description: string;
  categoryId: number | null;
}

export interface CategoryFormData {
  name: string;
  description: string;
  isActive: boolean;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Component Props Types
export interface ProductTableProps {
  products: ProductItem[];
  onEdit: (product: ProductItem) => void;
  onDelete: (id: number) => void;
  onUpdateInventory: (id: number, quantity: number) => void;
  loading?: boolean;
}

export interface CategorySelectorProps {
  categories: ProductCategoryItem[];
  selectedCategoryId?: number;
  onCategoryChange: (categoryId?: number) => void;
  allowEmpty?: boolean;
}

export interface InventoryStatusProps {
  product: ProductItem;
  showDetails?: boolean;
  onQuickUpdate?: (quantity: number) => void;
}

// Utility Types
export type ProductSortField = 'name' | 'sku' | 'price' | 'quantity' | 'status';
export type CategorySortField = 'name' | 'productCount' | 'isActive';

export interface SortConfig<T> {
  field: T;
  order: 'asc' | 'desc';
}

// Constants for UI
export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  [ProductStatus.InStock]: 'In Stock',
  [ProductStatus.OutOfStock]: 'Out of Stock',
  [ProductStatus.Discontinued]: 'Discontinued',
  [ProductStatus.PreOrder]: 'Pre-Order'
};

export const PRODUCT_STATUS_COLORS: Record<ProductStatus, string> = {
  [ProductStatus.InStock]: 'success',
  [ProductStatus.OutOfStock]: 'error',
  [ProductStatus.Discontinued]: 'warning',
  [ProductStatus.PreOrder]: 'info'
};

// Helper Functions Types
export type FormatCurrency = (amount: number) => string;
export type FormatQuantity = (quantity: number) => string;
export type GetStatusBadgeColor = (status: ProductStatus) => string;
export type ValidateProduct = (product: Partial<ProductFormData>) => FormValidationResult;
export type ValidateCategory = (category: Partial<CategoryFormData>) => FormValidationResult;
