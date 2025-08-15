"use client"

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  useCreateCategoryMutation, 
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '@/store/api/productInventoryApi';
import { categoryFormSchema } from '@/lib/validations';
import { type ProductCategoryItem } from '../../../../types/api';
import { useToast } from '@/lib/use-toast';
import { 
  Archive, 
  Save, 
  X, 
  Loader2,
  AlertCircle,
  Trash2,
  Edit,
  Plus,
} from 'lucide-react';

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  category?: ProductCategoryItem;
  onSuccess?: (category: ProductCategoryItem) => void;
  onCancel?: () => void;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CategoryForm({ 
  category, 
  onSuccess, 
  onCancel, 
  trigger,
  isOpen,
  onOpenChange 
}: CategoryFormProps) {
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const { toast } = useToast();

  const isEditing = Boolean(category);
  const isLoading = isCreating || isUpdating;

  const form = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      isActive: category?.isActive ?? true,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = form;

  const watchedIsActive = watch('isActive');

  const handleClose = () => {
    reset();
    onCancel?.();
    onOpenChange?.(false);
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      let result;
      
      if (isEditing && category?.id) {
        await updateCategory({
          id: category.id,
          ...data,
        }).unwrap();
        
        toast({
          title: 'Category Updated',
          description: `${data.name} has been successfully updated.`,
          variant: 'default',
        });
        
        // Create updated category object
        result = { ...category, ...data };
      } else {
        result = await createCategory(data).unwrap();
        
        toast({
          title: 'Category Created',
          description: `${data.name} has been successfully created.`,
          variant: 'default',
        });
      }

      onSuccess?.(result as ProductCategoryItem);
      handleClose();
    } catch (error) {
      console.error('Error saving category:', error);
      
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} category. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!category?.id) return;

    if (category.productCount > 0) {
      toast({
        title: 'Cannot Delete Category',
        description: `This category contains ${category.productCount} products. Please move or delete the products first.`,
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteCategory(category.id).unwrap();
      
      toast({
        title: 'Category Deleted',
        description: `${category.name} has been successfully deleted.`,
        variant: 'default',
      });

      handleClose();
    } catch (error) {
      console.error('Error deleting category:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to delete category. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Category Information</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              placeholder="Enter category name"
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
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Enter category description (optional)"
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

          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant={watchedIsActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setValue('isActive', true)}
              >
                Active
              </Button>
              <Button
                type="button"
                variant={!watchedIsActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setValue('isActive', false)}
              >
                Inactive
              </Button>
              <Badge variant={watchedIsActive ? 'default' : 'secondary'}>
                {watchedIsActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {watchedIsActive 
                ? 'This category is visible and can be assigned to products.' 
                : 'This category is hidden and cannot be assigned to new products.'
              }
            </p>
          </div>

          {/* Category Stats (for editing) */}
          {isEditing && category && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Category Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Products:</span>
                  <span className="ml-2 font-medium">{category.productCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={category.isActive ? 'default' : 'secondary'} className="ml-2">
                    {category.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <DialogFooter className="flex flex-col sm:flex-row gap-2">
        {isEditing && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || Boolean(category?.productCount && category.productCount > 0)}
            className="sm:mr-auto"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Category
              </>
            )}
          </Button>
        )}
        
        <div className="flex gap-2 sm:ml-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading || isDeleting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !isValid || isDeleting}
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
                {isEditing ? 'Update Category' : 'Create Category'}
              </>
            )}
          </Button>
        </div>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              {isEditing ? 'Edit Category' : 'Create New Category'}
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              {isEditing ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Archive className="h-6 w-6" />
          {isEditing ? 'Edit Category' : 'Create New Category'}
        </h1>
        <p className="text-muted-foreground">
          {isEditing 
            ? 'Update the category information below.' 
            : 'Fill in the details to create a new category.'
          }
        </p>
      </div>
      {formContent}
    </div>
  );
}

// Quick Add Category Button Component
export function QuickAddCategoryButton({ onSuccess }: { onSuccess?: (category: ProductCategoryItem) => void }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <CategoryForm
      trigger={
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      }
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSuccess={(category) => {
        onSuccess?.(category);
        setIsOpen(false);
      }}
    />
  );
}

// Edit Category Button Component
export function EditCategoryButton({ 
  category, 
  onSuccess 
}: { 
  category: ProductCategoryItem; 
  onSuccess?: (category: ProductCategoryItem) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <CategoryForm
      category={category}
      trigger={
        <Button size="sm" variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      }
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSuccess={(updatedCategory) => {
        onSuccess?.(updatedCategory);
        setIsOpen(false);
      }}
    />
  );
}
