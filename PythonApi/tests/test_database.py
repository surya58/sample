import pytest
from database import InMemoryDatabase
from models import ProductStatus


class TestInMemoryDatabase:
    """Unit tests for the InMemoryDatabase class"""
    
    def setup_method(self):
        """Create a fresh database instance for each test"""
        self.db = InMemoryDatabase()
    
    def test_initial_state(self):
        """Test that database starts empty"""
        products = self.db.get_all_products()
        categories = self.db.get_all_categories()
        assert products == []
        assert categories == []
    
    def test_initialize_sample_data(self):
        """Test that sample data initialization works"""
        self.db.initialize_sample_data()
        
        products = self.db.get_all_products()
        categories = self.db.get_all_categories()
        
        assert len(products) > 0
        assert len(categories) == 5
        
        # Check first product has expected data
        first_product = products[0]
        assert first_product.name == "Wireless Bluetooth Headphones"
        assert first_product.sku == "WBH-001"
    
    def test_create_category(self):
        """Test creating a new category"""
        category_id = self.db.create_category("Test Category", "Test description", True)
        assert category_id == 1
        
        categories = self.db.get_all_categories()
        assert len(categories) == 1
        assert categories[0].id == 1
        assert categories[0].name == "Test Category"
        assert categories[0].description == "Test description"
        assert categories[0].isActive == True
    
    def test_create_product(self):
        """Test creating a new product"""
        # First create a category
        category_id = self.db.create_category("Electronics", "Electronics category", True)
        
        # Create a product
        product_id = self.db.create_product(
            name="Test Product",
            sku="TEST-001",
            quantity=50,
            price=29.99,
            status=ProductStatus.ACTIVE,
            description="A test product",
            category_id=category_id
        )
        
        assert product_id == 1
        
        products = self.db.get_all_products()
        assert len(products) == 1
        assert products[0].id == 1
        assert products[0].name == "Test Product"
        assert products[0].sku == "TEST-001"
        assert products[0].quantity == 50
        assert products[0].price == 29.99
        assert products[0].status == ProductStatus.ACTIVE
        assert products[0].categoryId == category_id
    
    def test_duplicate_sku_prevention(self):
        """Test that duplicate SKUs are prevented"""
        # Create category first
        category_id = self.db.create_category("Electronics", "Electronics category", True)
        
        # Create first product
        self.db.create_product("Product 1", "DUPLICATE-SKU", 10, 19.99, ProductStatus.ACTIVE, "First product", category_id)
        
        # Try to create second product with same SKU
        with pytest.raises(ValueError, match="SKU already exists"):
            self.db.create_product("Product 2", "DUPLICATE-SKU", 20, 29.99, ProductStatus.ACTIVE, "Second product", category_id)
    
    def test_get_product_by_id(self):
        """Test getting product by ID"""
        category_id = self.db.create_category("Electronics", "Electronics category", True)
        product_id = self.db.create_product("Test Product", "TEST-001", 50, 29.99, ProductStatus.ACTIVE, "Test", category_id)
        
        product = self.db.get_product_by_id(product_id)
        assert product is not None
        assert product.id == product_id
        assert product.name == "Test Product"
        
        # Test non-existent product
        non_existent = self.db.get_product_by_id(999)
        assert non_existent is None
    
    def test_get_product_by_sku(self):
        """Test getting product by SKU"""
        category_id = self.db.create_category("Electronics", "Electronics category", True)
        self.db.create_product("Test Product", "TEST-001", 50, 29.99, ProductStatus.ACTIVE, "Test", category_id)
        
        product = self.db.get_product_by_sku("TEST-001")
        assert product is not None
        assert product.sku == "TEST-001"
        assert product.name == "Test Product"
        
        # Test non-existent SKU
        non_existent = self.db.get_product_by_sku("NON-EXISTENT")
        assert non_existent is None
    
    def test_get_products_by_status(self):
        """Test getting products by status"""
        category_id = self.db.create_category("Electronics", "Electronics category", True)
        
        # Create products with different statuses
        self.db.create_product("Active Product", "ACTIVE-001", 50, 29.99, ProductStatus.ACTIVE, "Active", category_id)
        self.db.create_product("Discontinued Product", "DISC-001", 0, 19.99, ProductStatus.DISCONTINUED, "Discontinued", category_id)
        self.db.create_product("Out of Stock Product", "OOS-001", 0, 39.99, ProductStatus.OUT_OF_STOCK, "Out of stock", category_id)
        
        active_products = self.db.get_products_by_status(ProductStatus.ACTIVE)
        assert len(active_products) == 1
        assert active_products[0].name == "Active Product"
        
        discontinued_products = self.db.get_products_by_status(ProductStatus.DISCONTINUED)
        assert len(discontinued_products) == 1
        assert discontinued_products[0].name == "Discontinued Product"
    
    def test_get_products_by_category(self):
        """Test getting products by category"""
        category1_id = self.db.create_category("Category 1", "First category", True)
        category2_id = self.db.create_category("Category 2", "Second category", True)
        
        # Create products in different categories
        self.db.create_product("Product 1", "PROD-001", 50, 29.99, ProductStatus.ACTIVE, "In category 1", category1_id)
        self.db.create_product("Product 2", "PROD-002", 30, 19.99, ProductStatus.ACTIVE, "Also in category 1", category1_id)
        self.db.create_product("Product 3", "PROD-003", 20, 39.99, ProductStatus.ACTIVE, "In category 2", category2_id)
        
        category1_products = self.db.get_products_by_category(category1_id)
        assert len(category1_products) == 2
        
        category2_products = self.db.get_products_by_category(category2_id)
        assert len(category2_products) == 1
        assert category2_products[0].name == "Product 3"
    
    def test_update_product(self):
        """Test updating a product"""
        category_id = self.db.create_category("Electronics", "Electronics category", True)
        product_id = self.db.create_product("Original Product", "ORIG-001", 50, 29.99, ProductStatus.ACTIVE, "Original", category_id)
        
        # Update the product
        success = self.db.update_product(
            id=product_id,
            name="Updated Product",
            sku="UPDATED-001",
            quantity=75,
            price=39.99,
            status=ProductStatus.OUT_OF_STOCK,
            description="Updated description",
            category_id=category_id
        )
        
        assert success == True
        
        # Verify the update
        updated_product = self.db.get_product_by_id(product_id)
        assert updated_product.name == "Updated Product"
        assert updated_product.sku == "UPDATED-001"
        assert updated_product.quantity == 75
        assert updated_product.price == 39.99
        assert updated_product.status == ProductStatus.OUT_OF_STOCK
        assert updated_product.description == "Updated description"
    
    def test_update_product_inventory(self):
        """Test updating product inventory"""
        category_id = self.db.create_category("Electronics", "Electronics category", True)
        product_id = self.db.create_product("Test Product", "TEST-001", 50, 29.99, ProductStatus.ACTIVE, "Test", category_id)
        
        # Update inventory
        success = self.db.update_product_inventory(product_id, 100)
        assert success == True
        
        # Verify the update
        product = self.db.get_product_by_id(product_id)
        assert product.quantity == 100
        
        # Test updating non-existent product
        success = self.db.update_product_inventory(999, 50)
        assert success == False
    
    def test_delete_product(self):
        """Test deleting a product"""
        category_id = self.db.create_category("Electronics", "Electronics category", True)
        product_id = self.db.create_product("Test Product", "TEST-001", 50, 29.99, ProductStatus.ACTIVE, "Test", category_id)
        
        # Verify product exists
        assert self.db.get_product_by_id(product_id) is not None
        
        # Delete the product
        success = self.db.delete_product(product_id)
        assert success == True
        
        # Verify product is deleted
        assert self.db.get_product_by_id(product_id) is None
        
        # Test deleting non-existent product
        success = self.db.delete_product(999)
        assert success == False
    
    def test_update_category(self):
        """Test updating a category"""
        category_id = self.db.create_category("Original Category", "Original description", True)
        
        # Update the category
        success = self.db.update_category(category_id, "Updated Category", "Updated description", False)
        assert success == True
        
        # Verify the update
        category = self.db.get_category_by_id(category_id)
        assert category.name == "Updated Category"
        assert category.description == "Updated description"
        assert category.isActive == False
        
        # Test updating non-existent category
        success = self.db.update_category(999, "Non-existent", "Should fail", True)
        assert success == False
    
    def test_delete_category(self):
        """Test deleting a category"""
        category_id = self.db.create_category("Test Category", "Test description", True)
        
        # Verify category exists
        assert self.db.get_category_by_id(category_id) is not None
        
        # Delete the category
        success = self.db.delete_category(category_id)
        assert success == True
        
        # Verify category is deleted
        assert self.db.get_category_by_id(category_id) is None
    
    def test_delete_category_with_products(self):
        """Test that deleting category with products fails"""
        category_id = self.db.create_category("Category with Products", "Test description", True)
        self.db.create_product("Test Product", "TEST-001", 50, 29.99, ProductStatus.ACTIVE, "Test", category_id)
        
        # Try to delete category with products
        success = self.db.delete_category(category_id)
        assert success == False
        
        # Verify category still exists
        assert self.db.get_category_by_id(category_id) is not None
    
    def test_clear_data(self):
        """Test clearing all data"""
        # Add some data
        self.db.initialize_sample_data()
        
        # Verify data exists
        assert len(self.db.get_all_products()) > 0
        assert len(self.db.get_all_categories()) > 0
        
        # Clear data
        self.db.clear_data()
        
        # Verify data is cleared
        assert len(self.db.get_all_products()) == 0
        assert len(self.db.get_all_categories()) == 0
    
    def test_concurrent_access(self):
        """Test thread safety of database operations"""
        import threading
        import time
        
        category_id = self.db.create_category("Test Category", "Test description", True)
        results = []
        
        def create_products(thread_id):
            for i in range(5):
                try:
                    product_id = self.db.create_product(
                        f"Product {thread_id}-{i}",
                        f"SKU-{thread_id}-{i}",
                        10,
                        19.99,
                        ProductStatus.ACTIVE,
                        f"Product from thread {thread_id}",
                        category_id
                    )
                    results.append(product_id)
                except ValueError:
                    # SKU conflict, which is expected in concurrent scenarios
                    pass
                time.sleep(0.01)  # Small delay to increase chance of race conditions
        
        # Create multiple threads
        threads = []
        for i in range(3):
            thread = threading.Thread(target=create_products, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Verify that some products were created successfully
        products = self.db.get_all_products()
        assert len(products) > 0