# RTK Query Cache Management Documentation

## Overview

This document outlines the cache management strategies for the Product Inventory API using RTK Query. The API provides comprehensive product and category management with optimized caching for better performance and user experience.

## API Endpoints Overview

### Product Endpoints
- `GET /api/Products` - Get all products with category information
- `GET /api/Products/{id}` - Get specific product by ID
- `GET /api/Products/sku/{sku}` - Get product by SKU
- `GET /api/Products/status/{status}` - Filter products by status
- `GET /api/Products/category/{categoryId}` - Filter products by category
- `POST /api/Products` - Create new product
- `PUT /api/Products/{id}` - Update product
- `PATCH /api/Products/{id}/inventory` - Update inventory quantity
- `DELETE /api/Products/{id}` - Delete product

### Category Endpoints
- `GET /api/ProductCategories` - Get all categories with product counts
- `GET /api/ProductCategories/{id}` - Get category details with products
- `GET /api/ProductCategories/{id}/products` - Get products in category
- `POST /api/ProductCategories` - Create new category
- `PUT /api/ProductCategories/{id}` - Update category
- `DELETE /api/ProductCategories/{id}` - Delete category

## RTK Query Implementation

### Base API Configuration

\`\`\`typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Product', 'Category', 'ProductList', 'CategoryList'],
  endpoints: (builder) => ({
    // Endpoints defined below
  }),
})
\`\`\`

### Cache Tag Strategy

#### Tag Types
- **Product**: Individual product cache entries
- **Category**: Individual category cache entries  
- **ProductList**: Product list queries (filtered and unfiltered)
- **CategoryList**: Category list queries

#### Tagging Strategy
- All product queries are tagged with both specific product IDs and list tags
- Category queries include category-specific tags and list tags
- Mutations invalidate relevant cache entries using tag relationships

### Product Endpoints Implementation

\`\`\`typescript
// Get all products
getProducts: builder.query<ProductItem[], void>({
  query: () => 'Products',
  providesTags: (result) => [
    'ProductList',
    ...(result?.map(({ id }) => ({ type: 'Product' as const, id })) ?? [])
  ],
}),

// Get product by ID
getProductById: builder.query<ProductItem, number>({
  query: (id) => \`Products/\${id}\`,
  providesTags: (result, error, id) => [{ type: 'Product', id }],
}),

// Get products by category
getProductsByCategory: builder.query<ProductItem[], number>({
  query: (categoryId) => \`Products/category/\${categoryId}\`,
  providesTags: (result, error, categoryId) => [
    { type: 'ProductList', id: \`category-\${categoryId}\` },
    ...(result?.map(({ id }) => ({ type: 'Product' as const, id })) ?? [])
  ],
}),

// Get products by status
getProductsByStatus: builder.query<ProductItem[], ProductStatus>({
  query: (status) => \`Products/status/\${status}\`,
  providesTags: (result, error, status) => [
    { type: 'ProductList', id: \`status-\${status}\` },
    ...(result?.map(({ id }) => ({ type: 'Product' as const, id })) ?? [])
  ],
}),

// Create product
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
      const { data: productId } = await queryFulfilled
      // Optionally refetch related queries
      dispatch(productApi.util.invalidateTags(['ProductList']))
    } catch {}
  },
}),

// Update product
updateProduct: builder.mutation<void, UpdateProductCommand>({
  query: ({ id, ...patch }) => ({
    url: \`Products/\${id}\`,
    method: 'PUT',
    body: { id, ...patch },
  }),
  invalidatesTags: (result, error, { id }) => [
    { type: 'Product', id },
    'ProductList',
    'CategoryList'
  ],
}),

// Update inventory
updateInventory: builder.mutation<void, UpdateInventoryCommand>({
  query: ({ id, ...patch }) => ({
    url: \`Products/\${id}/inventory\`,
    method: 'PATCH',
    body: { id, ...patch },
  }),
  invalidatesTags: (result, error, { id }) => [
    { type: 'Product', id },
    'ProductList'
  ],
  // Optimistic update for inventory changes
  async onQueryStarted({ id, quantity }, { dispatch, queryFulfilled }) {
    const patchResult = dispatch(
      productApi.util.updateQueryData('getProductById', id, (draft) => {
        draft.quantity = quantity
      })
    )
    try {
      await queryFulfilled
    } catch {
      patchResult.undo()
    }
  },
}),

// Delete product
deleteProduct: builder.mutation<void, number>({
  query: (id) => ({
    url: \`Products/\${id}\`,
    method: 'DELETE',
  }),
  invalidatesTags: (result, error, id) => [
    { type: 'Product', id },
    'ProductList',
    'CategoryList'
  ],
}),
\`\`\`

### Category Endpoints Implementation

\`\`\`typescript
// Get all categories
getCategories: builder.query<ProductCategoryItem[], void>({
  query: () => 'ProductCategories',
  providesTags: (result) => [
    'CategoryList',
    ...(result?.map(({ id }) => ({ type: 'Category' as const, id })) ?? [])
  ],
}),

// Get category by ID
getCategoryById: builder.query<ProductCategoryDetail, number>({
  query: (id) => \`ProductCategories/\${id}\`,
  providesTags: (result, error, id) => [
    { type: 'Category', id },
    { type: 'ProductList', id: \`category-\${id}\` }
  ],
}),

// Create category
createCategory: builder.mutation<number, CreateProductCategoryCommand>({
  query: (category) => ({
    url: 'ProductCategories',
    method: 'POST',
    body: category,
  }),
  invalidatesTags: ['CategoryList'],
}),

// Update category
updateCategory: builder.mutation<void, UpdateProductCategoryCommand>({
  query: ({ id, ...patch }) => ({
    url: \`ProductCategories/\${id}\`,
    method: 'PUT',
    body: { id, ...patch },
  }),
  invalidatesTags: (result, error, { id }) => [
    { type: 'Category', id },
    'CategoryList',
    'ProductList'
  ],
}),

// Delete category
deleteCategory: builder.mutation<void, number>({
  query: (id) => ({
    url: \`ProductCategories/\${id}\`,
    method: 'DELETE',
  }),
  invalidatesTags: (result, error, id) => [
    { type: 'Category', id },
    'CategoryList',
    'ProductList'
  ],
}),
\`\`\`

## Cache Management Best Practices

### 1. Selective Invalidation
- Use specific tag IDs for targeted cache invalidation
- Avoid invalidating entire cache when possible
- Use list-specific tags for filtered queries

### 2. Optimistic Updates
- Implement optimistic updates for inventory changes
- Provide immediate feedback for better UX
- Always include rollback mechanisms

### 3. Polling and Real-time Updates
\`\`\`typescript
// Enable polling for critical data
const { data: products } = useGetProductsQuery(undefined, {
  pollingInterval: 30000, // Poll every 30 seconds
  refetchOnFocus: true,
  refetchOnReconnect: true,
})
\`\`\`

### 4. Cache Persistence
\`\`\`typescript
// Configure cache persistence
const store = configureStore({
  reducer: {
    productApi: productApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(productApi.middleware),
})
\`\`\`

### 5. Error Handling
\`\`\`typescript
const {
  data: products,
  error,
  isLoading,
  isError,
  refetch,
} = useGetProductsQuery()

if (isError) {
  // Handle error appropriately
  console.error('Failed to load products:', error)
}
\`\`\`

## Performance Optimization

### 1. Data Normalization
- Products and categories are automatically normalized by RTK Query
- Use entity IDs for efficient lookups
- Minimize data duplication across cache entries

### 2. Query Deduplication
- RTK Query automatically deduplicates identical queries
- Concurrent requests for same data share single network call
- Cache sharing across components reduces API calls

### 3. Background Refetching
- Configure stale time appropriately for your use case
- Use background refetching for data freshness
- Implement cache warming for critical data

## Integration Examples

### Product Management Component
\`\`\`typescript
const ProductManager = () => {
  const { data: products, isLoading } = useGetProductsQuery()
  const [updateInventory] = useUpdateInventoryMutation()
  const [deleteProduct] = useDeleteProductMutation()

  const handleInventoryUpdate = async (id: number, quantity: number) => {
    try {
      await updateInventory({ id, quantity }).unwrap()
      // Success feedback
    } catch (error) {
      // Error handling
    }
  }

  return (
    // Component JSX
  )
}
\`\`\`

### Category Filter Component
\`\`\`typescript
const CategoryFilter = ({ selectedCategory }: { selectedCategory: number }) => {
  const { data: categories } = useGetCategoriesQuery()
  const { data: products } = useGetProductsByCategoryQuery(selectedCategory, {
    skip: !selectedCategory,
  })

  return (
    // Filter UI
  )
}
\`\`\`

This cache management strategy ensures optimal performance, data consistency, and excellent user experience across your product inventory application.
