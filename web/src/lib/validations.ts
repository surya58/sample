import { z } from 'zod';
import { ProductStatus } from '../../../types/api';

// Product form validation schema with enhanced validation
export const productFormSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name must be less than 100 characters')
    .trim()
    .refine(val => val.length > 0, 'Product name cannot be empty or only whitespace'),
  
  sku: z.string()
    .min(1, 'SKU is required')
    .min(3, 'SKU must be at least 3 characters')
    .max(50, 'SKU must be less than 50 characters')
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-_]+$/, 'SKU must contain only uppercase letters, numbers, hyphens, and underscores')
    .refine(val => !val.startsWith('-') && !val.endsWith('-'), 'SKU cannot start or end with a hyphen')
    .refine(val => !val.includes('--'), 'SKU cannot contain consecutive hyphens'),
  
  quantity: z.number()
    .min(0, 'Quantity cannot be negative')
    .max(999999, 'Quantity cannot exceed 999,999')
    .int('Quantity must be a whole number')
    .finite('Quantity must be a valid number'),
  
  price: z.number()
    .min(0.01, 'Price must be greater than $0.00')
    .max(999999.99, 'Price cannot exceed $999,999.99')
    .multipleOf(0.01, 'Price must have at most 2 decimal places')
    .finite('Price must be a valid number'),
  
  status: z.nativeEnum(ProductStatus, {
    message: 'Please select a valid product status',
  }),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional()
    .transform(val => val === '' ? undefined : val),
  
  categoryId: z.number()
    .int('Category ID must be a whole number')
    .positive('Please select a category')
    .optional()
    .nullable(),
}).refine(data => {
  // Custom validation: Out of stock products should have quantity 0
  if (data.status === ProductStatus.OutOfStock && data.quantity > 0) {
    return false;
  }
  return true;
}, {
  message: 'Out of stock products should have quantity set to 0',
  path: ['quantity']
}).refine(data => {
  // Custom validation: Pre-order products shouldn't have quantity > 0
  if (data.status === ProductStatus.PreOrder && data.quantity > 0) {
    return false;
  }
  return true;
}, {
  message: 'Pre-order products should not have current stock quantity',
  path: ['quantity']
});

// Category form validation schema with enhanced validation
export const categoryFormSchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must be less than 100 characters')
    .trim()
    .refine(val => val.length > 0, 'Category name cannot be empty or only whitespace')
    .refine(val => !val.match(/^\d+$/), 'Category name cannot be only numbers')
    .refine(val => val.match(/^[a-zA-Z0-9\s\-_&()]+$/), 'Category name contains invalid characters'),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional(),
  
  isActive: z.boolean({
    message: 'Active status must be true or false'
  }),
});

// Inventory update form validation schema
export const inventoryUpdateSchema = z.object({
  quantity: z.number()
    .min(0, 'Quantity cannot be negative')
    .max(999999, 'Quantity cannot exceed 999,999')
    .int('Quantity must be a whole number'),
});

// Search and filter schemas
export const productFilterSchema = z.object({
  categoryId: z.number().int().positive().optional().nullable(),
  status: z.nativeEnum(ProductStatus).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  searchTerm: z.string().max(100).optional(),
  inStock: z.boolean().optional(),
});

export const categoryFilterSchema = z.object({
  isActive: z.boolean().optional(),
  hasProducts: z.boolean().optional(),
});

// Bulk operations schemas
export const bulkUpdateInventorySchema = z.object({
  updates: z.array(z.object({
    id: z.number().int().positive(),
    quantity: z.number().min(0).max(999999).int(),
  })).min(1, 'At least one product must be selected'),
});

export const bulkUpdateStatusSchema = z.object({
  productIds: z.array(z.number().int().positive()).min(1, 'At least one product must be selected'),
  status: z.nativeEnum(ProductStatus),
});

// Type inference for forms
export type ProductFormData = z.infer<typeof productFormSchema>;
export type CategoryFormData = z.infer<typeof categoryFormSchema>;
export type InventoryUpdateData = z.infer<typeof inventoryUpdateSchema>;
export type ProductFilterData = z.infer<typeof productFilterSchema>;
export type CategoryFilterData = z.infer<typeof categoryFilterSchema>;
export type BulkUpdateInventoryData = z.infer<typeof bulkUpdateInventorySchema>;
export type BulkUpdateStatusData = z.infer<typeof bulkUpdateStatusSchema>;

// Validation helper functions
export const validateProductForm = (data: unknown) => {
  return productFormSchema.safeParse(data);
};

export const validateCategoryForm = (data: unknown) => {
  return categoryFormSchema.safeParse(data);
};

export const validateInventoryUpdate = (data: unknown) => {
  return inventoryUpdateSchema.safeParse(data);
};

// Custom validation rules
export const isValidSKU = (sku: string): boolean => {
  return /^[A-Z0-9-]+$/.test(sku);
};

export const isValidPrice = (price: number): boolean => {
  return price > 0 && price <= 999999.99 && Number.isFinite(price);
};

export const isValidQuantity = (quantity: number): boolean => {
  return Number.isInteger(quantity) && quantity >= 0 && quantity <= 999999;
};
