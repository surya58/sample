"use client"

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  useCreateProductMutation, 
  useUpdateProductMutation,
  useGetCategoriesQuery,
} from '@/store/api/productInventoryApi';
import { productFormSchema } from '@/lib/validations';
import { ProductStatus, type ProductItem } from '../../../../types/api';
import { useToast } from '@/lib/use-toast';
import { 
  Package, 
  Save, 
  X, 
  Loader2,
  DollarSign,
  Hash,
  Archive,
  AlertCircle,
} from 'lucide-react';

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: ProductItem;
  onSuccess?: (product: ProductItem) => void;
  onCancel?: () => void;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const getStatusColor = (status: ProductStatus) => {
  switch (status) {
    case ProductStatus.InStock:
      return 'bg-green-100 text-green-800 border-green-300';
    case ProductStatus.OutOfStock:
      return 'bg-red-100 text-red-800 border-red-300';
    case ProductStatus.Discontinued:
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case ProductStatus.PreOrder:
      return 'bg-blue-100 text-blue-800 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusLabel = (status: ProductStatus) => {
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

export default function ProductForm({ 
  product, 
  onSuccess, 
  onCancel, 
  trigger,
  isOpen,
  onOpenChange 
}: ProductFormProps) {
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { toast } = useToast();

  const isEditing = Boolean(product);
  const isLoading = isCreating || isUpdating || categoriesLoading;

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? '',
      sku: product?.sku ?? '',
      description: product?.description ?? '',
      price: typeof product?.price === 'number' ? product.price : 0,
      quantity: typeof product?.quantity === 'number' ? product.quantity : 0,
      categoryId: typeof product?.categoryId === 'number' ? product.categoryId : null,
      status: product?.status ?? ProductStatus.InStock,
    },
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = form;

  const watchedStatus = watch('status');
  const watchedCategoryId = watch('categoryId');

  const handleClose = () => {
    reset();
    onCancel?.();
    onOpenChange?.(false);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      let result;
      
      // Clean up categoryId - convert undefined to null for API
      const cleanData = {
        ...data,
        categoryId: data.categoryId || undefined,
      };
      
      if (isEditing && product?.id) {
        await updateProduct({
          id: product.id,
          ...cleanData,
        }).unwrap();
        
        toast({
          title: 'Product Updated',
          description: `${data.name} has been successfully updated.`,
          variant: 'default',
        });
        
        // Refetch to get updated product data
        result = { ...product, ...cleanData };
      } else {
        result = await createProduct(cleanData).unwrap();
        
        toast({
          title: 'Product Created',
          description: `${data.name} has been successfully created.`,
          variant: 'default',
        });
      }

      onSuccess?.(result as ProductItem);
      handleClose();
    } catch (error) {
      console.error('Error saving product:', error);
      
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} product. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const selectedCategory = categories.find(cat => cat.id === watchedCategoryId);

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Basic Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              placeholder="Enter product name"
              {...register('name')}
              className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU *</Label>
            <div className="relative">
              <Hash className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="sku"
                placeholder="PRD-001"
                className={`pl-8 ${errors.sku ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                {...register('sku')}
              />
            </div>
            {errors.sku && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.sku.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            placeholder="Enter product description"
            className={`w-full min-h-[80px] px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none rounded-md ${
              errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''
            }`}
            {...register('description')}
          />
          {errors.description && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Pricing & Inventory */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Pricing & Inventory</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                className={`pl-8 ${errors.price ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                {...register('price', { valueAsNumber: true })}
              />
            </div>
            {errors.price && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.price.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="0"
              className={errors.quantity ? 'border-red-500 focus-visible:ring-red-500' : ''}
              {...register('quantity', { valueAsNumber: true })}
            />
            {errors.quantity && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.quantity.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Category & Status */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Category & Status</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={watchedCategoryId?.toString() || ''}
              onValueChange={(value) => setValue('categoryId', value ? parseInt(value) : undefined)}
            >
              <SelectTrigger className={errors.categoryId ? 'border-red-500 focus:ring-red-500' : ''}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id!.toString()}>
                    {category.name}
                    {category.description && (
                      <span className="text-muted-foreground ml-2">
                        - {category.description}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategory && (
              <p className="text-xs text-muted-foreground">
                {selectedCategory.productCount || 0} products in this category
              </p>
            )}
            {errors.categoryId && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={watchedStatus?.toString()}
              onValueChange={(value) => setValue('status', parseInt(value) as ProductStatus)}
            >
              <SelectTrigger className={errors.status ? 'border-red-500 focus:ring-red-500' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ProductStatus.InStock.toString()}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    In Stock
                  </div>
                </SelectItem>
                <SelectItem value={ProductStatus.OutOfStock.toString()}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    Out of Stock
                  </div>
                </SelectItem>
                <SelectItem value={ProductStatus.Discontinued.toString()}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    Discontinued
                  </div>
                </SelectItem>
                <SelectItem value={ProductStatus.PreOrder.toString()}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Pre-Order
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {watchedStatus && (
              <Badge className={getStatusColor(watchedStatus)}>
                {getStatusLabel(watchedStatus)}
              </Badge>
            )}
            {errors.status && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.status.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <DialogFooter className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !isValid}
          className={`min-w-[120px] ${
            !isValid ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title={!isValid ? 'Please fix validation errors before submitting' : ''}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Product' : 'Create Product'}
            </>
          )}
        </Button>
        {!isValid && Object.keys(errors).length > 0 && (
          <p className="text-sm text-red-500 flex items-center gap-1 mt-2">
            <AlertCircle className="h-3 w-3" />
            Please fix {Object.keys(errors).length} validation error{Object.keys(errors).length > 1 ? 's' : ''} above
          </p>
        )}
      </DialogFooter>
    </form>
  );

  if (trigger && trigger !== null) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {isEditing ? 'Edit Product' : 'Create New Product'}
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  // Handle external dialog control (when trigger is null but isOpen is controlled externally)
  if (isOpen !== undefined) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {isEditing ? 'Edit Product' : 'Create New Product'}
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6" />
          {isEditing ? 'Edit Product' : 'Create New Product'}
        </h1>
        <p className="text-muted-foreground">
          {isEditing 
            ? 'Update the product information below.' 
            : 'Fill in the details to create a new product.'
          }
        </p>
      </div>
      {formContent}
    </div>
  );
}
