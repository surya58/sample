import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AppDispatch } from '../index';
import type {
  ProductItem,
  ProductCategoryItem,
  ProductCategoryDetail,
  CreateProductCommand,
  UpdateProductCommand,
  UpdateInventoryCommand,
  CreateProductCategoryCommand,
  UpdateProductCategoryCommand,
} from '../../../../types/api';
import { ProductStatus } from '../../../../types/api';

// Base API configuration
export const productInventoryApi = createApi({
  reducerPath: 'productInventoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Product', 'Category', 'ProductList', 'CategoryList'],
  endpoints: (builder) => ({
    // Product Endpoints
    getProducts: builder.query<ProductItem[], void>({
      query: () => 'Products',
      providesTags: (result) => [
        'ProductList',
        ...(result?.map(({ id }) => ({ type: 'Product' as const, id })) ?? []),
      ],
    }),

    getProductById: builder.query<ProductItem, number>({
      query: (id) => `Products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    getProductBySku: builder.query<ProductItem, string>({
      query: (sku) => `Products/sku/${sku}`,
      providesTags: (result) => result ? [{ type: 'Product', id: result.id }] : [],
    }),

    getProductsByStatus: builder.query<ProductItem[], ProductStatus>({
      query: (status) => `Products/status/${status}`,
      providesTags: (result, error, status) => [
        { type: 'ProductList', id: `status-${status}` },
        ...(result?.map(({ id }) => ({ type: 'Product' as const, id })) ?? []),
      ],
    }),

    getProductsByCategory: builder.query<ProductItem[], number>({
      query: (categoryId) => `Products/category/${categoryId}`,
      providesTags: (result, error, categoryId) => [
        { type: 'ProductList', id: `category-${categoryId}` },
        ...(result?.map(({ id }) => ({ type: 'Product' as const, id })) ?? []),
      ],
    }),

    createProduct: builder.mutation<number, CreateProductCommand>({
      query: (product) => ({
        url: 'Products',
        method: 'POST',
        body: product,
      }),
      invalidatesTags: ['ProductList', 'CategoryList'],
      // Optimistic update for better UX
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate relevant cache entries
          dispatch(productInventoryApi.util.invalidateTags(['ProductList']));
          if (arg.categoryId) {
            dispatch(productInventoryApi.util.invalidateTags([
              { type: 'ProductList', id: `category-${arg.categoryId}` }
            ]));
          }
        } catch {}
      },
    }),

    updateProduct: builder.mutation<void, UpdateProductCommand>({
      query: ({ id, ...patch }) => ({
        url: `Products/${id}`,
        method: 'PUT',
        body: { id, ...patch },
      }),
      invalidatesTags: (result, error, { id, categoryId }) => [
        { type: 'Product', id },
        'ProductList',
        'CategoryList',
        ...(categoryId ? [{ type: 'ProductList' as const, id: `category-${categoryId}` }] : []),
      ],
      // Optimistic update
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productInventoryApi.util.updateQueryData('getProductById', arg.id, (draft) => {
            Object.assign(draft, arg);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    updateInventory: builder.mutation<void, UpdateInventoryCommand>({
      query: ({ id, ...patch }) => ({
        url: `Products/${id}/inventory`,
        method: 'PATCH',
        body: { id, ...patch },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        'ProductList',
      ],
      // Optimistic update for inventory changes
      async onQueryStarted({ id, quantity }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productInventoryApi.util.updateQueryData('getProductById', id, (draft) => {
            draft.quantity = quantity;
            // Update status based on quantity
            if (quantity === 0) {
              draft.status = ProductStatus.OutOfStock;
            } else if (draft.status === ProductStatus.OutOfStock) {
              draft.status = ProductStatus.InStock;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `Products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        'ProductList',
        'CategoryList',
      ],
    }),

    // Category Endpoints
    getCategories: builder.query<ProductCategoryItem[], void>({
      query: () => 'ProductCategories',
      providesTags: (result) => [
        'CategoryList',
        ...(result?.map(({ id }) => ({ type: 'Category' as const, id })) ?? []),
      ],
    }),

    getCategoryById: builder.query<ProductCategoryDetail, number>({
      query: (id) => `ProductCategories/${id}`,
      providesTags: (result, error, id) => [
        { type: 'Category', id },
        { type: 'ProductList', id: `category-${id}` },
      ],
    }),

    getProductsInCategory: builder.query<ProductItem[], number>({
      query: (id) => `ProductCategories/${id}/products`,
      providesTags: (result, error, categoryId) => [
        { type: 'ProductList', id: `category-${categoryId}` },
        ...(result?.map(({ id }) => ({ type: 'Product' as const, id })) ?? []),
      ],
    }),

    createCategory: builder.mutation<number, CreateProductCategoryCommand>({
      query: (category) => ({
        url: 'ProductCategories',
        method: 'POST',
        body: category,
      }),
      invalidatesTags: ['CategoryList'],
    }),

    updateCategory: builder.mutation<void, UpdateProductCategoryCommand>({
      query: ({ id, ...patch }) => ({
        url: `ProductCategories/${id}`,
        method: 'PUT',
        body: { id, ...patch },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        'CategoryList',
        'ProductList',
      ],
      // Optimistic update
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productInventoryApi.util.updateQueryData('getCategoryById', arg.id, (draft) => {
            Object.assign(draft, arg);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `ProductCategories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Category', id },
        'CategoryList',
        'ProductList',
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Product hooks
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductBySkuQuery,
  useGetProductsByStatusQuery,
  useGetProductsByCategoryQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateInventoryMutation,
  useDeleteProductMutation,
  
  // Category hooks
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetProductsInCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = productInventoryApi;

// Export utility functions
export const {
  util: { 
    updateQueryData,
    upsertQueryData,
    invalidateTags,
    resetApiState,
  },
  reducerPath,
  reducer,
  middleware,
} = productInventoryApi;

// Custom hooks for common patterns
export const useProductsWithRealTimeUpdates = (pollingInterval = 30000) => {
  return useGetProductsQuery(undefined, {
    pollingInterval,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
};

export const useCategoriesWithRealTimeUpdates = (pollingInterval = 60000) => {
  return useGetCategoriesQuery(undefined, {
    pollingInterval,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
};

// Selector hooks for derived data
export const useProductsByStatusCount = () => {
  return useGetProductsQuery(undefined, {
    selectFromResult: ({ data, ...otherProps }) => ({
      ...otherProps,
      statusCounts: data ? {
        inStock: data.filter(p => p.status === ProductStatus.InStock).length,
        outOfStock: data.filter(p => p.status === ProductStatus.OutOfStock).length,
        discontinued: data.filter(p => p.status === ProductStatus.Discontinued).length,
        preOrder: data.filter(p => p.status === ProductStatus.PreOrder).length,
      } : undefined,
    }),
  });
};

export const useLowStockProducts = (threshold = 10) => {
  return useGetProductsQuery(undefined, {
    selectFromResult: ({ data, ...otherProps }) => ({
      ...otherProps,
      lowStockProducts: data?.filter(p => 
        p.quantity <= threshold && p.status === ProductStatus.InStock
      ) || [],
    }),
  });
};

// Prefetch utilities for performance optimization
export const prefetchProduct = (id: number) => (dispatch: AppDispatch) => {
  dispatch(productInventoryApi.util.prefetch('getProductById', id, { force: false }));
};

export const prefetchCategory = (id: number) => (dispatch: AppDispatch) => {
  dispatch(productInventoryApi.util.prefetch('getCategoryById', id, { force: false }));
};

export default productInventoryApi;
