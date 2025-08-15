import React from 'react';
import { useGetProductsQuery, useGetCategoriesQuery } from '../store/api/productInventoryApi';

export const ProductInventoryDemo: React.FC = () => {
  const { 
    data: products, 
    isLoading: productsLoading, 
    error: productsError 
  } = useGetProductsQuery();
  
  const { 
    data: categories, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useGetCategoriesQuery();

  if (productsLoading || categoriesLoading) {
    return <div className="p-4">Loading inventory...</div>;
  }

  if (productsError || categoriesError) {
    return (
      <div className="p-4 text-red-600">
        Error loading data: {JSON.stringify(productsError || categoriesError)}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Product Inventory Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Categories ({categories?.length || 0})</h2>
          <div className="space-y-2">
            {categories?.map((category) => (
              <div key={category.id} className="flex justify-between items-center p-2 border-b">
                <span className="font-medium">{category.name}</span>
                <span className="text-sm text-gray-500">{category.productCount} products</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Products ({products?.length || 0})</h2>
          <div className="space-y-2">
            {products?.slice(0, 10).map((product) => (
              <div key={product.id} className="flex justify-between items-center p-2 border-b">
                <div>
                  <span className="font-medium">{product.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({product.sku})</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${product.price}</div>
                  <div className="text-xs text-gray-500">Qty: {product.quantity}</div>
                </div>
              </div>
            ))}
            {(products?.length || 0) > 10 && (
              <div className="text-center text-sm text-gray-500 pt-2">
                ... and {(products?.length || 0) - 10} more products
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInventoryDemo;
