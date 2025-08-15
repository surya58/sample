from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, RedirectResponse
from typing import List
from models import (
    ProductItem, Product, CreateProductCommand, UpdateProductCommand, UpdateInventoryCommand,
    ProductCategoryItem, CreateProductCategoryCommand, UpdateProductCategoryCommand,
    ProductStatus
)
from database import db

app = FastAPI(title="Product Inventory API", version="v1", docs_url="/swagger", redoc_url="/redoc")
app.title = "Product Inventory API"
app.version = "v1"
app.description = "Product Inventory Management API"

# Configure CORS to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Send interactive user to swagger page by default
@app.get("/")
async def redirect_to_swagger():
    return RedirectResponse(url="/swagger")

# Product endpoints
@app.get("/api/Products", response_model=List[ProductItem], tags=["Products"], operation_id="GetProducts")
async def get_products():
    return db.get_all_products()


@app.get("/api/Products/{id}", response_model=ProductItem, tags=["Products"], operation_id="GetProductById")
async def get_product_by_id(id: int):
    product = db.get_product_by_id(id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Convert to ProductItem with category name
    category_name = None
    if product.categoryId:
        category = db.get_category_by_id(product.categoryId)
        category_name = category.name if category else None
    
    return ProductItem(
        id=product.id,
        name=product.name,
        sku=product.sku,
        quantity=product.quantity,
        price=product.price,
        status=product.status,
        description=product.description,
        categoryId=product.categoryId,
        categoryName=category_name
    )


@app.get("/api/Products/sku/{sku}", response_model=ProductItem, tags=["Products"], operation_id="GetProductBySku")
async def get_product_by_sku(sku: str):
    product = db.get_product_by_sku(sku)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Convert to ProductItem with category name
    category_name = None
    if product.categoryId:
        category = db.get_category_by_id(product.categoryId)
        category_name = category.name if category else None
    
    return ProductItem(
        id=product.id,
        name=product.name,
        sku=product.sku,
        quantity=product.quantity,
        price=product.price,
        status=product.status,
        description=product.description,
        categoryId=product.categoryId,
        categoryName=category_name
    )


@app.get("/api/Products/status/{status}", response_model=List[ProductItem], tags=["Products"], operation_id="GetProductsByStatus")
async def get_products_by_status(status: ProductStatus):
    return db.get_products_by_status(status)


@app.get("/api/Products/category/{category_id}", response_model=List[ProductItem], tags=["Products"], operation_id="GetProductsByCategory")
async def get_products_by_category(category_id: int):
    return db.get_products_by_category(category_id)


@app.post("/api/Products", response_model=int, tags=["Products"], operation_id="CreateProduct")
async def create_product(command: CreateProductCommand):
    try:
        product_id = db.create_product(
            name=command.name,
            sku=command.sku,
            quantity=command.quantity,
            price=command.price,
            status=command.status,
            description=command.description,
            category_id=command.categoryId
        )
        return product_id
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/api/Products/{id}", tags=["Products"], operation_id="UpdateProduct")
async def update_product(id: int, command: UpdateProductCommand):
    try:
        success = db.update_product(
            id=id,
            name=command.name,
            sku=command.sku,
            quantity=command.quantity,
            price=command.price,
            status=command.status,
            description=command.description,
            category_id=command.categoryId
        )
        if not success:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return Response(status_code=200)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.patch("/api/Products/{id}/inventory", tags=["Products"], operation_id="UpdateInventory")
async def update_inventory(id: int, command: UpdateInventoryCommand):
    success = db.update_product_inventory(id, command.quantity)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return Response(status_code=200)


@app.delete("/api/Products/{id}", tags=["Products"], operation_id="DeleteProduct")
async def delete_product(id: int):
    success = db.delete_product(id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return Response(status_code=200)


# Category endpoints
@app.get("/api/ProductCategories", response_model=List[ProductCategoryItem], tags=["Categories"], operation_id="GetCategories")
async def get_categories():
    return db.get_all_categories()


@app.get("/api/ProductCategories/{id}", response_model=ProductCategoryItem, tags=["Categories"], operation_id="GetCategoryById")
async def get_category_by_id(id: int):
    category = db.get_category_by_id(id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Get product count for this category
    product_count = sum(1 for p in db.get_all_products() if p.categoryId == id)
    
    return ProductCategoryItem(
        id=category.id,
        name=category.name,
        description=category.description,
        isActive=category.isActive,
        productCount=product_count
    )


@app.get("/api/ProductCategories/{id}/products", response_model=List[ProductItem], tags=["Categories"], operation_id="GetProductsInCategory")
async def get_products_in_category(id: int):
    category = db.get_category_by_id(id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return db.get_products_by_category(id)


@app.post("/api/ProductCategories", response_model=int, tags=["Categories"], operation_id="CreateCategory")
async def create_category(command: CreateProductCategoryCommand):
    category_id = db.create_category(
        name=command.name,
        description=command.description,
        is_active=command.isActive
    )
    return category_id


@app.put("/api/ProductCategories/{id}", tags=["Categories"], operation_id="UpdateCategory")
async def update_category(id: int, command: UpdateProductCategoryCommand):
    success = db.update_category(
        id=id,
        name=command.name,
        description=command.description,
        is_active=command.isActive
    )
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return Response(status_code=200)


@app.delete("/api/ProductCategories/{id}", tags=["Categories"], operation_id="DeleteCategory")
async def delete_category(id: int):
    success = db.delete_category(id)
    if not success:
        # Check if it's because there are products in this category
        products_in_category = db.get_products_by_category(id)
        if products_in_category:
            raise HTTPException(status_code=400, detail="Cannot delete category with existing products")
        else:
            raise HTTPException(status_code=404, detail="Category not found")
    
    return Response(status_code=200)
