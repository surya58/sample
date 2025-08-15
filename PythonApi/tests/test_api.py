import pytest
from fastapi.testclient import TestClient
from main import app
from database import db
from models import ProductStatus

client = TestClient(app)


def setup_function():
    """Reset database before each test"""
    db.clear_data()
    db.initialize_sample_data()


class TestProducts:
    def test_get_all_products(self):
        """Test getting all products returns sample data"""
        response = client.get("/api/Products")
        assert response.status_code == 200
        products = response.json()
        assert len(products) > 0
        
        # Check structure of first product
        product = products[0]
        assert "id" in product
        assert "name" in product
        assert "sku" in product
        assert "quantity" in product
        assert "price" in product
        assert "status" in product
        assert "categoryName" in product


    def test_get_product_by_id_exists(self):
        """Test getting existing product by ID"""
        response = client.get("/api/Products/1")
        assert response.status_code == 200
        product = response.json()
        assert product["id"] == 1
        assert product["name"] == "Wireless Bluetooth Headphones"
        assert product["sku"] == "WBH-001"


    def test_get_product_by_id_not_found(self):
        """Test getting non-existent product by ID"""
        response = client.get("/api/Products/999")
        assert response.status_code == 404
        assert response.json()["detail"] == "Product not found"


    def test_get_product_by_sku_exists(self):
        """Test getting existing product by SKU"""
        response = client.get("/api/Products/sku/WBH-001")
        assert response.status_code == 200
        product = response.json()
        assert product["sku"] == "WBH-001"
        assert product["name"] == "Wireless Bluetooth Headphones"


    def test_get_product_by_sku_not_found(self):
        """Test getting non-existent product by SKU"""
        response = client.get("/api/Products/sku/INVALID-SKU")
        assert response.status_code == 404
        assert response.json()["detail"] == "Product not found"


    def test_get_products_by_status_active(self):
        """Test getting products by status"""
        response = client.get(f"/api/Products/status/{ProductStatus.ACTIVE}")
        assert response.status_code == 200
        products = response.json()
        assert len(products) > 0
        # All returned products should have Active status
        for product in products:
            assert product["status"] == ProductStatus.ACTIVE


    def test_get_products_by_status_discontinued(self):
        """Test getting discontinued products"""
        response = client.get(f"/api/Products/status/{ProductStatus.DISCONTINUED}")
        assert response.status_code == 200
        products = response.json()
        # Should have one discontinued product in sample data
        assert len(products) == 1
        assert products[0]["status"] == ProductStatus.DISCONTINUED


    def test_get_products_by_category(self):
        """Test getting products by category"""
        response = client.get("/api/Products/category/1")
        assert response.status_code == 200
        products = response.json()
        assert len(products) > 0
        # All returned products should belong to category 1
        for product in products:
            assert product["categoryId"] == 1


    def test_create_product_valid(self):
        """Test creating a new product with valid data"""
        new_product = {
            "name": "Test Product",
            "sku": "TEST-001",
            "quantity": 50,
            "price": 29.99,
            "status": ProductStatus.ACTIVE,
            "description": "A test product",
            "categoryId": 1
        }
        
        response = client.post("/api/Products", json=new_product)
        assert response.status_code == 200
        product_id = response.json()
        assert isinstance(product_id, int)
        assert product_id > 0
        
        # Verify product was created
        get_response = client.get(f"/api/Products/{product_id}")
        assert get_response.status_code == 200
        created_product = get_response.json()
        assert created_product["name"] == new_product["name"]
        assert created_product["sku"] == new_product["sku"]


    def test_create_product_duplicate_sku(self):
        """Test creating a product with duplicate SKU should fail"""
        new_product = {
            "name": "Duplicate SKU Product",
            "sku": "WBH-001",  # This SKU already exists in sample data
            "quantity": 10,
            "price": 19.99,
            "status": ProductStatus.ACTIVE,
            "description": "Should fail due to duplicate SKU",
            "categoryId": 1
        }
        
        response = client.post("/api/Products", json=new_product)
        assert response.status_code == 400
        assert "SKU already exists" in response.json()["detail"]


    def test_update_product_valid(self):
        """Test updating existing product with valid data"""
        update_data = {
            "name": "Updated Headphones",
            "sku": "WBH-001-UPDATED",
            "quantity": 25,
            "price": 89.99,
            "status": ProductStatus.ACTIVE,
            "description": "Updated description",
            "categoryId": 1
        }
        
        response = client.put("/api/Products/1", json=update_data)
        assert response.status_code == 200
        
        # Verify product was updated
        get_response = client.get("/api/Products/1")
        assert get_response.status_code == 200
        updated_product = get_response.json()
        assert updated_product["name"] == update_data["name"]
        assert updated_product["sku"] == update_data["sku"]
        assert updated_product["quantity"] == update_data["quantity"]


    def test_update_product_not_found(self):
        """Test updating non-existent product"""
        update_data = {
            "name": "Non-existent Product",
            "sku": "NON-EXIST",
            "quantity": 0,
            "price": 0.0,
            "status": ProductStatus.ACTIVE,
            "description": "",
            "categoryId": 1
        }
        
        response = client.put("/api/Products/999", json=update_data)
        assert response.status_code == 404
        assert response.json()["detail"] == "Product not found"


    def test_update_inventory_valid(self):
        """Test updating product inventory"""
        new_quantity = 100
        
        response = client.patch("/api/Products/1/inventory", json={"quantity": new_quantity})
        assert response.status_code == 200
        
        # Verify inventory was updated
        get_response = client.get("/api/Products/1")
        assert get_response.status_code == 200
        product = get_response.json()
        assert product["quantity"] == new_quantity


    def test_update_inventory_not_found(self):
        """Test updating inventory for non-existent product"""
        response = client.patch("/api/Products/999/inventory", json={"quantity": 50})
        assert response.status_code == 404
        assert response.json()["detail"] == "Product not found"


    def test_delete_product_valid(self):
        """Test deleting existing product"""
        response = client.delete("/api/Products/1")
        assert response.status_code == 200
        
        # Verify product was deleted
        get_response = client.get("/api/Products/1")
        assert get_response.status_code == 404


    def test_delete_product_not_found(self):
        """Test deleting non-existent product"""
        response = client.delete("/api/Products/999")
        assert response.status_code == 404
        assert response.json()["detail"] == "Product not found"


class TestCategories:
    def test_get_all_categories(self):
        """Test getting all categories returns sample data"""
        response = client.get("/api/ProductCategories")
        assert response.status_code == 200
        categories = response.json()
        assert len(categories) == 5  # Sample data has 5 categories
        
        # Check structure of first category
        category = categories[0]
        assert "id" in category
        assert "name" in category
        assert "description" in category
        assert "isActive" in category
        assert "productCount" in category


    def test_get_category_by_id_exists(self):
        """Test getting existing category by ID"""
        response = client.get("/api/ProductCategories/1")
        assert response.status_code == 200
        category = response.json()
        assert category["id"] == 1
        assert category["name"] == "Electronics"
        assert category["productCount"] > 0


    def test_get_category_by_id_not_found(self):
        """Test getting non-existent category by ID"""
        response = client.get("/api/ProductCategories/999")
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"


    def test_get_products_in_category_exists(self):
        """Test getting products in existing category"""
        response = client.get("/api/ProductCategories/1/products")
        assert response.status_code == 200
        products = response.json()
        assert len(products) > 0
        # All products should belong to category 1
        for product in products:
            assert product["categoryId"] == 1


    def test_get_products_in_category_not_found(self):
        """Test getting products in non-existent category"""
        response = client.get("/api/ProductCategories/999/products")
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"


    def test_create_category_valid(self):
        """Test creating a new category with valid data"""
        new_category = {
            "name": "Test Category",
            "description": "A test category",
            "isActive": True
        }
        
        response = client.post("/api/ProductCategories", json=new_category)
        assert response.status_code == 200
        category_id = response.json()
        assert isinstance(category_id, int)
        assert category_id > 0
        
        # Verify category was created
        get_response = client.get(f"/api/ProductCategories/{category_id}")
        assert get_response.status_code == 200
        created_category = get_response.json()
        assert created_category["name"] == new_category["name"]
        assert created_category["description"] == new_category["description"]


    def test_update_category_valid(self):
        """Test updating existing category with valid data"""
        update_data = {
            "name": "Updated Electronics",
            "description": "Updated description for electronics",
            "isActive": True
        }
        
        response = client.put("/api/ProductCategories/1", json=update_data)
        assert response.status_code == 200
        
        # Verify category was updated
        get_response = client.get("/api/ProductCategories/1")
        assert get_response.status_code == 200
        updated_category = get_response.json()
        assert updated_category["name"] == update_data["name"]
        assert updated_category["description"] == update_data["description"]


    def test_update_category_not_found(self):
        """Test updating non-existent category"""
        update_data = {
            "name": "Non-existent Category",
            "description": "Should fail",
            "isActive": True
        }
        
        response = client.put("/api/ProductCategories/999", json=update_data)
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"


    def test_delete_category_with_products(self):
        """Test deleting category that has products should fail"""
        response = client.delete("/api/ProductCategories/1")
        assert response.status_code == 400
        assert "Cannot delete category with existing products" in response.json()["detail"]


    def test_delete_category_without_products(self):
        """Test deleting category without products should succeed"""
        # First create a new category without products
        new_category = {
            "name": "Empty Category",
            "description": "Category without products",
            "isActive": True
        }
        
        create_response = client.post("/api/ProductCategories", json=new_category)
        assert create_response.status_code == 200
        category_id = create_response.json()
        
        # Now delete it
        delete_response = client.delete(f"/api/ProductCategories/{category_id}")
        assert delete_response.status_code == 200
        
        # Verify category was deleted
        get_response = client.get(f"/api/ProductCategories/{category_id}")
        assert get_response.status_code == 404


    def test_delete_category_not_found(self):
        """Test deleting non-existent category"""
        response = client.delete("/api/ProductCategories/999")
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"


class TestIntegration:
    def test_product_category_relationship(self):
        """Test that product-category relationships work correctly"""
        # Get a product and verify its category information
        response = client.get("/api/Products/1")
        assert response.status_code == 200
        product = response.json()
        
        category_id = product["categoryId"]
        category_name = product["categoryName"]
        
        # Get the category directly and verify it matches
        cat_response = client.get(f"/api/ProductCategories/{category_id}")
        assert cat_response.status_code == 200
        category = cat_response.json()
        assert category["name"] == category_name


    def test_inventory_management_workflow(self):
        """Test complete inventory management workflow"""
        # Create a new product
        new_product = {
            "name": "Workflow Test Product",
            "sku": "WTP-001",
            "quantity": 100,
            "price": 49.99,
            "status": ProductStatus.ACTIVE,
            "description": "Product for testing workflow",
            "categoryId": 1
        }
        
        create_response = client.post("/api/Products", json=new_product)
        assert create_response.status_code == 200
        product_id = create_response.json()
        
        # Update inventory
        client.patch(f"/api/Products/{product_id}/inventory", json={"quantity": 75})
        
        # Verify inventory was updated
        get_response = client.get(f"/api/Products/{product_id}")
        product = get_response.json()
        assert product["quantity"] == 75
        
        # Update product status to discontinued
        update_data = new_product.copy()
        update_data["status"] = ProductStatus.DISCONTINUED
        update_data["quantity"] = 75  # Keep the updated quantity
        
        client.put(f"/api/Products/{product_id}", json=update_data)
        
        # Verify product is now discontinued
        get_response = client.get(f"/api/Products/{product_id}")
        product = get_response.json()
        assert product["status"] == ProductStatus.DISCONTINUED
        
        # Clean up - delete the product
        delete_response = client.delete(f"/api/Products/{product_id}")
        assert delete_response.status_code == 200


class TestErrorHandling:
    def test_invalid_product_status(self):
        """Test handling of invalid product status"""
        response = client.get("/api/Products/status/999")
        assert response.status_code == 422  # FastAPI validation error


    def test_invalid_product_data(self):
        """Test creating product with invalid data"""
        invalid_product = {
            "name": "",  # Empty name
            "sku": "",   # Empty SKU
            "quantity": -1,  # Negative quantity
            "price": -10.0,  # Negative price
            "status": ProductStatus.ACTIVE,
            "categoryId": 1
        }
        
        response = client.post("/api/Products", json=invalid_product)
        assert response.status_code == 422  # FastAPI validation error


    def test_invalid_category_data(self):
        """Test creating category with invalid data"""
        invalid_category = {
            "name": "",  # Empty name
            "description": None,  # None description should be ok
            "isActive": "not_boolean"  # Invalid boolean
        }
        
        response = client.post("/api/ProductCategories", json=invalid_category)
        assert response.status_code == 422  # FastAPI validation error