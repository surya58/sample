/* eslint-disable -- Auto Generated File */
import { emptySplitApi as api } from "../empty-api";
export const addTagTypes = ["ProductCategories"] as const;
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
export const {
  useGetProductCategoriesQuery,
  useCreateProductCategoryMutation,
  useGetProductCategoryByIdQuery,
  useUpdateProductCategoryMutation,
  useDeleteProductCategoryMutation,
} = injectedRtkApi;
