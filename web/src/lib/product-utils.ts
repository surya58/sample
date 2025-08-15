import type { ProductItem } from '../../../types/api';
import { ProductStatus } from '../../../types/api';

// Format currency values
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format numbers with commas
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Get status badge variant
export const getStatusBadgeVariant = (status: ProductStatus): 'success' | 'destructive' | 'warning' | 'info' | 'secondary' => {
  switch (status) {
    case ProductStatus.InStock:
      return 'success';
    case ProductStatus.OutOfStock:
      return 'destructive';
    case ProductStatus.Discontinued:
      return 'warning';
    case ProductStatus.PreOrder:
      return 'info';
    default:
      return 'secondary';
  }
};

// Get status label
export const getStatusLabel = (status: ProductStatus): string => {
  switch (status) {
    case ProductStatus.InStock:
      return 'In Stock';
    case ProductStatus.OutOfStock:
      return 'Out of Stock';
    case ProductStatus.Discontinued:
      return 'Discontinued';
    case ProductStatus.PreOrder:
      return 'Pre-Order';
    default:
      return 'Unknown';
  }
};

// Low stock alert checker
export const isLowStock = (product: ProductItem, threshold: number = 10): boolean => {
  return (product.quantity || 0) <= threshold && product.status === ProductStatus.InStock;
};

// Filter products by various criteria
export const filterProducts = (
  products: ProductItem[],
  filters: {
    categoryId?: number;
    status?: ProductStatus;
    searchTerm?: string;
    minPrice?: number;
    maxPrice?: number;
    lowStock?: boolean;
    inStock?: boolean;
  }
) => {
  return products.filter((product) => {
    // Category filter
    if (filters.categoryId && product.categoryId !== filters.categoryId) {
      return false;
    }
    
    // Status filter
    if (filters.status && product.status !== filters.status) {
      return false;
    }
    
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesName = product.name?.toLowerCase().includes(searchLower);
      const matchesSku = product.sku?.toLowerCase().includes(searchLower);
      const matchesDescription = product.description?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesSku && !matchesDescription) {
        return false;
      }
    }
    
    // Price range filter
    if (filters.minPrice && (product.price || 0) < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && (product.price || 0) > filters.maxPrice) {
      return false;
    }
    
    // Low stock filter
    if (filters.lowStock && !isLowStock(product)) {
      return false;
    }
    
    // In stock filter
    if (filters.inStock && (product.quantity || 0) === 0) {
      return false;
    }
    
    return true;
  });
};

// Sort products by various fields
export const sortProducts = (
  products: ProductItem[],
  sortBy: 'name' | 'sku' | 'price' | 'quantity' | 'status' | 'category',
  sortOrder: 'asc' | 'desc' = 'asc'
) => {
  return [...products].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name?.toLowerCase() || '';
        bValue = b.name?.toLowerCase() || '';
        break;
      case 'sku':
        aValue = a.sku?.toLowerCase() || '';
        bValue = b.sku?.toLowerCase() || '';
        break;
      case 'price':
        aValue = a.price || 0;
        bValue = b.price || 0;
        break;
      case 'quantity':
        aValue = a.quantity || 0;
        bValue = b.quantity || 0;
        break;
      case 'status':
        aValue = a.status || 0;
        bValue = b.status || 0;
        break;
      case 'category':
        aValue = a.categoryName?.toLowerCase() || '';
        bValue = b.categoryName?.toLowerCase() || '';
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

// Generate low stock alerts
export const getLowStockAlerts = (products: ProductItem[], threshold: number = 10) => {
  return products
    .filter(product => isLowStock(product, threshold))
    .map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      quantity: product.quantity,
      categoryName: product.categoryName,
      severity: (product.quantity || 0) === 0 ? 'critical' : 
                (product.quantity || 0) <= 5 ? 'high' : 'medium',
    }));
};

// Calculate inventory insights
export const getInventoryInsights = (products: ProductItem[]) => {
  const insights = {
    mostExpensiveProduct: null as ProductItem | null,
    cheapestProduct: null as ProductItem | null,
    highestQuantityProduct: null as ProductItem | null,
    lowestQuantityProduct: null as ProductItem | null,
    averageProductValue: 0,
    medianPrice: 0,
  };
  
  if (products.length === 0) return insights;
  
  const sortedByPrice = [...products].sort((a, b) => (a.price || 0) - (b.price || 0));
  const sortedByQuantity = [...products].sort((a, b) => (a.quantity || 0) - (b.quantity || 0));
  
  insights.mostExpensiveProduct = sortedByPrice[sortedByPrice.length - 1];
  insights.cheapestProduct = sortedByPrice[0];
  insights.highestQuantityProduct = sortedByQuantity[sortedByQuantity.length - 1];
  insights.lowestQuantityProduct = sortedByQuantity[0];
  
  const totalValue = products.reduce((sum, product) => sum + ((product.price || 0) * (product.quantity || 0)), 0);
  const totalQuantity = products.reduce((sum, product) => sum + (product.quantity || 0), 0);
  insights.averageProductValue = totalQuantity > 0 ? totalValue / totalQuantity : 0;
  
  const midIndex = Math.floor(sortedByPrice.length / 2);
  insights.medianPrice = sortedByPrice.length % 2 === 0
    ? ((sortedByPrice[midIndex - 1].price || 0) + (sortedByPrice[midIndex].price || 0)) / 2
    : sortedByPrice[midIndex].price || 0;
  
  return insights;
};
