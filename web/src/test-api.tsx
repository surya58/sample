"use client"

import React from 'react';
import { useGetProductsQuery, useGetCategoriesQuery } from '@/store/api/productInventoryApi';

export default function TestApi() {
  const { data: products, isLoading: productsLoading, error: productsError } = useGetProductsQuery();
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useGetCategoriesQuery();

  console.log('Test API - Products:', { products, productsLoading, productsError });
  console.log('Test API - Categories:', { categories, categoriesLoading, categoriesError });

  return (
    <div className="p-4">
      <h1>API Test</h1>
      <div>
        <h2>Products</h2>
        <p>Loading: {productsLoading ? 'Yes' : 'No'}</p>
        <p>Error: {productsError ? JSON.stringify(productsError) : 'None'}</p>
        <p>Count: {products?.length || 0}</p>
      </div>
      <div>
        <h2>Categories</h2>
        <p>Loading: {categoriesLoading ? 'Yes' : 'No'}</p>
        <p>Error: {categoriesError ? JSON.stringify(categoriesError) : 'None'}</p>
        <p>Count: {categories?.length || 0}</p>
      </div>
    </div>
  );
}
