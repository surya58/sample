from pydantic import BaseModel
from typing import Optional
from enum import IntEnum


class ProductStatus(IntEnum):
    InStock = 0
    OutOfStock = 1
    Discontinued = 2
    PreOrder = 3


class ProductItem(BaseModel):
    id: int
    name: str
    sku: str
    quantity: int
    price: float
    status: ProductStatus
    description: Optional[str] = None
    categoryId: Optional[int] = None
    categoryName: Optional[str] = None


class Product(BaseModel):
    id: int
    name: str
    sku: str
    quantity: int
    price: float
    status: ProductStatus
    description: Optional[str] = None
    categoryId: Optional[int] = None


class CreateProductCommand(BaseModel):
    name: str
    sku: str
    quantity: int
    price: float
    status: ProductStatus = ProductStatus.InStock
    description: Optional[str] = None
    categoryId: Optional[int] = None


class UpdateProductCommand(BaseModel):
    name: str
    sku: str
    quantity: int
    price: float
    status: ProductStatus
    description: Optional[str] = None
    categoryId: Optional[int] = None


class UpdateInventoryCommand(BaseModel):
    quantity: int


class ProductCategoryItem(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    isActive: bool = True
    productCount: int = 0


class ProductCategory(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    isActive: bool = True


class CreateProductCategoryCommand(BaseModel):
    name: str
    description: Optional[str] = None
    isActive: bool = True


class UpdateProductCategoryCommand(BaseModel):
    name: str
    description: Optional[str] = None
    isActive: bool