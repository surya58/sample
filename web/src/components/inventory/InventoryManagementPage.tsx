"use client"

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  useGetProductsQuery, 
  useGetCategoriesQuery,
  useDeleteProductMutation,
} from '@/store/api/productInventoryApi';
import { ProductStatus, type ProductItem } from '../../../../types/api';
import {
  filterProducts,
  sortProducts,
  getStatusBadgeVariant,
  getStatusLabel,
  formatCurrency,
  formatNumber,
} from '@/lib/product-utils';
import { useToast } from '@/lib/use-toast';
import ProductForm from './ProductForm';
import { QuickAddCategoryButton } from './CategoryForm';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  SortAsc,
  SortDesc,
  AlertTriangle,
} from 'lucide-react';

interface InventoryFilters {
  categoryId?: number;
  status?: ProductStatus;
  searchTerm: string;
  sortBy: 'name' | 'sku' | 'price' | 'quantity' | 'status' | 'category';
  sortOrder: 'asc' | 'desc';
  showLowStock: boolean;
}

export default function InventoryManagementPage() {
  const { data: products = [], isLoading: productsLoading, error: productsError } = useGetProductsQuery();
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const { toast } = useToast();

  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);

  const [filters, setFilters] = useState<InventoryFilters>({
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc',
    showLowStock: false,
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = filterProducts(products, {
      categoryId: filters.categoryId,
      status: filters.status,
      searchTerm: filters.searchTerm,
      lowStock: filters.showLowStock,
    });

    return sortProducts(filtered, filters.sortBy, filters.sortOrder);
  }, [products, filters]);

  const updateFilter = (key: keyof InventoryFilters, value: string | number | boolean | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleEditProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    setIsProductFormOpen(true);
  };

  const handleDeleteProduct = async (product: ProductItem) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteProduct(product.id).unwrap();
      
      toast({
        title: 'Product Deleted',
        description: `${product.name} has been successfully deleted.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleProductSuccess = () => {
    setSelectedProduct(null);
    setIsProductFormOpen(false);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsProductFormOpen(true);
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-lg">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load inventory data. Please try refreshing the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground">
            Manage your product inventory with full CRUD operations
          </p>
        </div>
        <div className="flex gap-2">
          <QuickAddCategoryButton />
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, SKU..."
                  className="pl-8"
                  value={filters.searchTerm}
                  onChange={(e) => updateFilter('searchTerm', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={filters.categoryId?.toString() || 'all'}
                onValueChange={(value) => updateFilter('categoryId', value === 'all' ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id!.toString()}>
                      {category.name} ({category.productCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status?.toString() || 'all'}
                onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : parseInt(value) as ProductStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={ProductStatus.InStock.toString()}>In Stock</SelectItem>
                  <SelectItem value={ProductStatus.OutOfStock.toString()}>Out of Stock</SelectItem>
                  <SelectItem value={ProductStatus.Discontinued.toString()}>Discontinued</SelectItem>
                  <SelectItem value={ProductStatus.PreOrder.toString()}>Pre-Order</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <div className="flex gap-2">
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilter('sortBy', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="sku">SKU</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="quantity">Quantity</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <Button
              variant={filters.showLowStock ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('showLowStock', !filters.showLowStock)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Low Stock Only
            </Button>
            <span className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {filters.searchTerm || filters.categoryId || filters.status !== undefined || filters.showLowStock
                            ? 'No products match your filters'
                            : 'No products found'
                          }
                        </p>
                        {!filters.searchTerm && !filters.categoryId && filters.status === undefined && !filters.showLowStock && (
                          <Button onClick={handleAddProduct} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Product
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-muted-foreground">
                              {product.description.substring(0, 50)}
                              {product.description.length > 50 && '...'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>
                        {product.categoryName || (
                          <span className="text-muted-foreground">No category</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(product.price || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={product.quantity <= 10 ? 'text-destructive font-medium' : ''}>
                            {formatNumber(product.quantity || 0)}
                          </span>
                          {product.quantity <= 10 && product.quantity > 0 && (
                            <AlertTriangle className="h-3 w-3 text-destructive" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(product.status)}>
                          {getStatusLabel(product.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Product Form Dialog */}
      <ProductForm
        product={selectedProduct || undefined}
        isOpen={isProductFormOpen}
        onOpenChange={setIsProductFormOpen}
        onSuccess={handleProductSuccess}
        trigger={null}
      />
    </div>
  );
}
