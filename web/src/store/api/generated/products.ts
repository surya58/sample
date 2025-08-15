/* eslint-disable -- Auto Generated File */
import { emptySplitApi as api } from "../empty-api";
export const addTagTypes = ["ProductCategories", "Products"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getProductCategories: build.query<
        GetProductCategoriesApiResponse,
        GetProductCategoriesApiArg
      >({
        query: () => ({ url: `/api/ProductCategories` }),
        providesTags: ["ProductCategories"],
      }),
      createProductCategory: build.mutation<
        CreateProductCategoryApiResponse,
        CreateProductCategoryApiArg
      >({
        query: (queryArg) => ({
          url: `/api/ProductCategories`,
          method: "POST",
          body: queryArg.createProductCategoryCommand,
        }),
        invalidatesTags: ["ProductCategories"],
      }),
      getProductCategoryById: build.query<
        GetProductCategoryByIdApiResponse,
        GetProductCategoryByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/ProductCategories/${queryArg.id}` }),
        providesTags: ["ProductCategories"],
      }),
      updateProductCategory: build.mutation<
        UpdateProductCategoryApiResponse,
        UpdateProductCategoryApiArg
      >({
        query: (queryArg) => ({
          url: `/api/ProductCategories/${queryArg.id}`,
          method: "PUT",
          body: queryArg.updateProductCategoryCommand,
        }),
        invalidatesTags: ["ProductCategories"],
      }),
      deleteProductCategory: build.mutation<
        DeleteProductCategoryApiResponse,
        DeleteProductCategoryApiArg
      >({
        query: (queryArg) => ({
          url: `/api/ProductCategories/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["ProductCategories"],
      }),
      getProductsInCategory: build.query<
        GetProductsInCategoryApiResponse,
        GetProductsInCategoryApiArg
      >({
        query: (queryArg) => ({
          url: `/api/ProductCategories/${queryArg.id}/products`,
        }),
        providesTags: ["ProductCategories"],
      }),
      getProducts: build.query<GetProductsApiResponse, GetProductsApiArg>({
        query: () => ({ url: `/api/Products` }),
        providesTags: ["Products"],
      }),
      createProduct: build.mutation<
        CreateProductApiResponse,
        CreateProductApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Products`,
          method: "POST",
          body: queryArg.createProductCommand,
        }),
        invalidatesTags: ["Products"],
      }),
      getProductById: build.query<
        GetProductByIdApiResponse,
        GetProductByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/Products/${queryArg.id}` }),
        providesTags: ["Products"],
      }),
      updateProduct: build.mutation<
        UpdateProductApiResponse,
        UpdateProductApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Products/${queryArg.id}`,
          method: "PUT",
          body: queryArg.updateProductCommand,
        }),
        invalidatesTags: ["Products"],
      }),
      deleteProduct: build.mutation<
        DeleteProductApiResponse,
        DeleteProductApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Products/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Products"],
      }),
      getProductBySku: build.query<
        GetProductBySkuApiResponse,
        GetProductBySkuApiArg
      >({
        query: (queryArg) => ({ url: `/api/Products/sku/${queryArg.sku}` }),
        providesTags: ["Products"],
      }),
      getProductsByStatus: build.query<
        GetProductsByStatusApiResponse,
        GetProductsByStatusApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Products/status/${queryArg.status}`,
        }),
        providesTags: ["Products"],
      }),
      getProductsByCategory: build.query<
        GetProductsByCategoryApiResponse,
        GetProductsByCategoryApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Products/category/${queryArg.categoryId}`,
        }),
        providesTags: ["Products"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as productInventoryApi };
export type GetProductCategoriesApiResponse =
  /** status 200  */ ProductCategoryItem[];
export type GetProductCategoriesApiArg = void;
export type CreateProductCategoryApiResponse = /** status 200  */ number;
export type CreateProductCategoryApiArg = {
  createProductCategoryCommand: CreateProductCategoryCommand;
};
export type GetProductCategoryByIdApiResponse =
  /** status 200  */ ProductCategoryDetail;
export type GetProductCategoryByIdApiArg = {
  id: number;
};
export type UpdateProductCategoryApiResponse = unknown;
export type UpdateProductCategoryApiArg = {
  id: number;
  updateProductCategoryCommand: UpdateProductCategoryCommand;
};
export type DeleteProductCategoryApiResponse = unknown;
export type DeleteProductCategoryApiArg = {
  id: number;
};
export type GetProductsInCategoryApiResponse = /** status 200  */ ProductItem[];
export type GetProductsInCategoryApiArg = {
  id: number;
};
export type GetProductsApiResponse = /** status 200  */ ProductItem[];
export type GetProductsApiArg = void;
export type CreateProductApiResponse = /** status 200  */ number;
export type CreateProductApiArg = {
  createProductCommand: CreateProductCommand;
};
export type GetProductByIdApiResponse = /** status 200  */ ProductItem;
export type GetProductByIdApiArg = {
  id: number;
};
export type UpdateProductApiResponse = unknown;
export type UpdateProductApiArg = {
  id: number;
  updateProductCommand: UpdateProductCommand;
};
export type DeleteProductApiResponse = unknown;
export type DeleteProductApiArg = {
  id: number;
};
export type GetProductBySkuApiResponse = /** status 200  */ ProductItem;
export type GetProductBySkuApiArg = {
  sku: string;
};
export type GetProductsByStatusApiResponse = /** status 200  */ ProductItem[];
export type GetProductsByStatusApiArg = {
  status: ProductStatus;
};
export type GetProductsByCategoryApiResponse = /** status 200  */ ProductItem[];
export type GetProductsByCategoryApiArg = {
  categoryId: number;
};
export type ProductCategoryItem = {
  id?: number;
  name?: string;
  description?: string | null;
  isActive?: boolean;
  productCount?: number;
};
export type CreateProductCategoryCommand = {
  name?: string;
  description?: string | null;
  isActive?: boolean;
};
export type ProductStatus =
  | "InStock"
  | "OutOfStock"
  | "Discontinued"
  | "PreOrder";
export type ProductItem = {
  id?: number;
  name?: string;
  sku?: string;
  quantity?: number;
  price?: number;
  status?: ProductStatus;
  description?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
};
export type ProductCategoryDetail = {
  id?: number;
  name?: string;
  description?: string | null;
  isActive?: boolean;
  products?: ProductItem[];
};
export type UpdateProductCategoryCommand = {
  id?: number;
  name?: string;
  description?: string | null;
  isActive?: boolean;
};
export type CreateProductCommand = {
  name?: string;
  sku?: string;
  quantity?: number;
  price?: number;
  status?: ProductStatus;
  description?: string | null;
  categoryId?: number | null;
};
export type UpdateProductCommand = {
  id?: number;
  name?: string;
  sku?: string;
  quantity?: number;
  price?: number;
  status?: ProductStatus;
  description?: string | null;
  categoryId?: number | null;
};
export const {
  useGetProductCategoriesQuery,
  useCreateProductCategoryMutation,
  useGetProductCategoryByIdQuery,
  useUpdateProductCategoryMutation,
  useDeleteProductCategoryMutation,
  useGetProductsInCategoryQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductBySkuQuery,
  useGetProductsByStatusQuery,
  useGetProductsByCategoryQuery,
} = injectedRtkApi;
