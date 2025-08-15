from typing import List, Optional
from models import ProductItem, Product, ProductCategoryItem, ProductCategory, ProductStatus
import threading


class InMemoryDatabase:
    def __init__(self):
        self._products: List[Product] = []
        self._categories: List[ProductCategory] = []
        self._next_product_id = 1
        self._next_category_id = 1
        self._lock = threading.Lock()
        
        # Initialize with some sample data
        self._initialize_sample_data()
    
    def _initialize_sample_data(self):
        """Initialize database with sample categories and products"""
        # Create sample categories
        categories = [
            {"name": "Electronics", "description": "Electronic devices and accessories"},
            {"name": "Clothing", "description": "Apparel and fashion items"},
            {"name": "Books", "description": "Books and educational materials"},
            {"name": "Home & Garden", "description": "Home improvement and garden supplies"},
            {"name": "Sports", "description": "Sports equipment and accessories"}
        ]
        
        for cat_data in categories:
            category = ProductCategory(
                id=self._next_category_id,
                name=cat_data["name"],
                description=cat_data["description"],
                isActive=True
            )
            self._categories.append(category)
            self._next_category_id += 1
        
        # Create sample products
        products = [
            {"name": "Wireless Headphones", "sku": "WH-001", "price": 199.99, "quantity": 50, "categoryId": 1},
            {"name": "Smartphone", "sku": "SP-002", "price": 699.99, "quantity": 25, "categoryId": 1},
            {"name": "Cotton T-Shirt", "sku": "CT-003", "price": 29.99, "quantity": 100, "categoryId": 2},
            {"name": "Jeans", "sku": "JN-004", "price": 79.99, "quantity": 75, "categoryId": 2},
            {"name": "Python Programming Book", "sku": "PB-005", "price": 49.99, "quantity": 30, "categoryId": 3},
            {"name": "Garden Hose", "sku": "GH-006", "price": 39.99, "quantity": 20, "categoryId": 4},
            {"name": "Basketball", "sku": "BB-007", "price": 24.99, "quantity": 15, "categoryId": 5}
        ]
        
        for prod_data in products:
            product = Product(
                id=self._next_product_id,
                name=prod_data["name"],
                sku=prod_data["sku"],
                price=prod_data["price"],
                quantity=prod_data["quantity"],
                status=ProductStatus.InStock if prod_data["quantity"] > 0 else ProductStatus.OutOfStock,
                categoryId=prod_data["categoryId"]
            )
            self._products.append(product)
            self._next_product_id += 1
    
    # Product methods
    def get_all_products(self) -> List[ProductItem]:
        with self._lock:
            result = []
            for product in self._products:
                category_name = None
                if product.categoryId:
                    category = self.get_category_by_id(product.categoryId)
                    category_name = category.name if category else None
                
                result.append(ProductItem(
                    id=product.id,
                    name=product.name,
                    sku=product.sku,
                    quantity=product.quantity,
                    price=product.price,
                    status=product.status,
                    description=product.description,
                    categoryId=product.categoryId,
                    categoryName=category_name
                ))
            return result
    
    def get_product_by_id(self, id: int) -> Optional[Product]:
        with self._lock:
            for product in self._products:
                if product.id == id:
                    return product
            return None
    
    def get_product_by_sku(self, sku: str) -> Optional[Product]:
        with self._lock:
            for product in self._products:
                if product.sku == sku:
                    return product
            return None
    
    def get_products_by_status(self, status: ProductStatus) -> List[ProductItem]:
        with self._lock:
            result = []
            for product in self._products:
                if product.status == status:
                    category_name = None
                    if product.categoryId:
                        category = self.get_category_by_id(product.categoryId)
                        category_name = category.name if category else None
                    
                    result.append(ProductItem(
                        id=product.id,
                        name=product.name,
                        sku=product.sku,
                        quantity=product.quantity,
                        price=product.price,
                        status=product.status,
                        description=product.description,
                        categoryId=product.categoryId,
                        categoryName=category_name
                    ))
            return result
    
    def get_products_by_category(self, category_id: int) -> List[ProductItem]:
        with self._lock:
            result = []
            category = self.get_category_by_id(category_id)
            category_name = category.name if category else None
            
            for product in self._products:
                if product.categoryId == category_id:
                    result.append(ProductItem(
                        id=product.id,
                        name=product.name,
                        sku=product.sku,
                        quantity=product.quantity,
                        price=product.price,
                        status=product.status,
                        description=product.description,
                        categoryId=product.categoryId,
                        categoryName=category_name
                    ))
            return result
    
    def create_product(self, name: str, sku: str, quantity: int, price: float, 
                      status: ProductStatus = ProductStatus.InStock, 
                      description: Optional[str] = None, 
                      category_id: Optional[int] = None) -> int:
        with self._lock:
            # Check if SKU already exists
            for product in self._products:
                if product.sku == sku:
                    raise ValueError(f"Product with SKU '{sku}' already exists")
            
            product = Product(
                id=self._next_product_id,
                name=name,
                sku=sku,
                quantity=quantity,
                price=price,
                status=status,
                description=description,
                categoryId=category_id
            )
            self._products.append(product)
            self._next_product_id += 1
            return product.id
    
    def update_product(self, id: int, name: str, sku: str, quantity: int, price: float,
                      status: ProductStatus, description: Optional[str] = None,
                      category_id: Optional[int] = None) -> bool:
        with self._lock:
            for product in self._products:
                if product.id == id:
                    # Check if SKU is being changed and conflicts with another product
                    if product.sku != sku:
                        for other_product in self._products:
                            if other_product.id != id and other_product.sku == sku:
                                raise ValueError(f"Product with SKU '{sku}' already exists")
                    
                    product.name = name
                    product.sku = sku
                    product.quantity = quantity
                    product.price = price
                    product.status = status
                    product.description = description
                    product.categoryId = category_id
                    return True
            return False
    
    def update_product_inventory(self, id: int, quantity: int) -> bool:
        with self._lock:
            for product in self._products:
                if product.id == id:
                    product.quantity = quantity
                    # Update status based on quantity
                    if quantity == 0:
                        product.status = ProductStatus.OutOfStock
                    elif product.status == ProductStatus.OutOfStock and quantity > 0:
                        product.status = ProductStatus.InStock
                    return True
            return False
    
    def delete_product(self, id: int) -> bool:
        with self._lock:
            for i, product in enumerate(self._products):
                if product.id == id:
                    del self._products[i]
                    return True
            return False
    
    # Category methods
    def get_all_categories(self) -> List[ProductCategoryItem]:
        with self._lock:
            result = []
            for category in self._categories:
                product_count = sum(1 for p in self._products if p.categoryId == category.id)
                result.append(ProductCategoryItem(
                    id=category.id,
                    name=category.name,
                    description=category.description,
                    isActive=category.isActive,
                    productCount=product_count
                ))
            return result
    
    def get_category_by_id(self, id: int) -> Optional[ProductCategory]:
        with self._lock:
            for category in self._categories:
                if category.id == id:
                    return category
            return None
    
    def create_category(self, name: str, description: Optional[str] = None, 
                       is_active: bool = True) -> int:
        with self._lock:
            category = ProductCategory(
                id=self._next_category_id,
                name=name,
                description=description,
                isActive=is_active
            )
            self._categories.append(category)
            self._next_category_id += 1
            return category.id
    
    def update_category(self, id: int, name: str, description: Optional[str] = None,
                       is_active: bool = True) -> bool:
        with self._lock:
            for category in self._categories:
                if category.id == id:
                    category.name = name
                    category.description = description
                    category.isActive = is_active
                    return True
            return False
    
    def delete_category(self, id: int) -> bool:
        with self._lock:
            # Check if any products are using this category
            for product in self._products:
                if product.categoryId == id:
                    return False  # Cannot delete category with products
            
            for i, category in enumerate(self._categories):
                if category.id == id:
                    del self._categories[i]
                    return True
            return False


db = InMemoryDatabase()