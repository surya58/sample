namespace ApiService.Data;

using Product.Models;

public static class DataSeeder
{
    public static async Task SeedDataAsync(ProductDbContext context)
    {
        // Check if data already exists
        if (context.ProductCategories.Any() || context.Products.Any())
        {
            return; // Data already seeded
        }

        // Create categories
        var categories = new List<ProductCategory>
        {
            new() { Name = "Electronics", Description = "Electronic devices, gadgets, and accessories", IsActive = true },
            new() { Name = "Clothing", Description = "Apparel, shoes, and fashion accessories", IsActive = true },
            new() { Name = "Home & Garden", Description = "Home improvement, furniture, and garden supplies", IsActive = true },
            new() { Name = "Sports & Fitness", Description = "Sports equipment, fitness gear, and outdoor activities", IsActive = true },
            new() { Name = "Books & Media", Description = "Books, magazines, movies, and digital media", IsActive = true }
        };

        context.ProductCategories.AddRange(categories);
        await context.SaveChangesAsync();

        // Create products
        var products = new List<Product>
        {
            // Electronics Category (4 products)
            new() { Name = "iPhone 15 Pro", Sku = "ELEC-001", Quantity = 25, Price = 999.99m, Status = ProductStatus.InStock, Description = "Latest iPhone with titanium design and A17 Pro chip", CategoryId = categories[0].Id },
            new() { Name = "Samsung 4K Smart TV", Sku = "ELEC-002", Quantity = 15, Price = 799.99m, Status = ProductStatus.InStock, Description = "55-inch 4K UHD Smart TV with HDR support", CategoryId = categories[0].Id },
            new() { Name = "MacBook Air M3", Sku = "ELEC-003", Quantity = 8, Price = 1299.99m, Status = ProductStatus.InStock, Description = "13-inch MacBook Air with M3 chip and 16GB RAM", CategoryId = categories[0].Id },
            new() { Name = "Sony WH-1000XM5", Sku = "ELEC-004", Quantity = 0, Price = 399.99m, Status = ProductStatus.OutOfStock, Description = "Premium noise-canceling wireless headphones", CategoryId = categories[0].Id },

            // Clothing Category (4 products)
            new() { Name = "Nike Air Max 270", Sku = "CLTH-001", Quantity = 45, Price = 149.99m, Status = ProductStatus.InStock, Description = "Men's running shoes with Max Air unit", CategoryId = categories[1].Id },
            new() { Name = "Levi's 501 Jeans", Sku = "CLTH-002", Quantity = 30, Price = 89.99m, Status = ProductStatus.InStock, Description = "Original fit classic blue jeans", CategoryId = categories[1].Id },
            new() { Name = "Patagonia Jacket", Sku = "CLTH-003", Quantity = 12, Price = 299.99m, Status = ProductStatus.InStock, Description = "Waterproof outdoor hiking jacket", CategoryId = categories[1].Id },
            new() { Name = "Champion Hoodie", Sku = "CLTH-004", Quantity = 5, Price = 59.99m, Status = ProductStatus.PreOrder, Description = "Comfortable cotton blend pullover hoodie", CategoryId = categories[1].Id },

            // Home & Garden Category (4 products)
            new() { Name = "Dyson V15 Detect", Sku = "HOME-001", Quantity = 18, Price = 749.99m, Status = ProductStatus.InStock, Description = "Cordless vacuum with laser dust detection", CategoryId = categories[2].Id },
            new() { Name = "KitchenAid Stand Mixer", Sku = "HOME-002", Quantity = 22, Price = 379.99m, Status = ProductStatus.InStock, Description = "5-quart artisan series stand mixer", CategoryId = categories[2].Id },
            new() { Name = "IKEA MALM Dresser", Sku = "HOME-003", Quantity = 0, Price = 179.99m, Status = ProductStatus.OutOfStock, Description = "6-drawer dresser in white oak veneer", CategoryId = categories[2].Id },
            new() { Name = "Weber Genesis Grill", Sku = "HOME-004", Quantity = 7, Price = 899.99m, Status = ProductStatus.InStock, Description = "3-burner gas grill with side burner", CategoryId = categories[2].Id },

            // Sports & Fitness Category (4 products)
            new() { Name = "Peloton Bike+", Sku = "SPRT-001", Quantity = 3, Price = 2495.00m, Status = ProductStatus.InStock, Description = "Indoor cycling bike with rotating touchscreen", CategoryId = categories[3].Id },
            new() { Name = "Nike Dri-FIT Shorts", Sku = "SPRT-002", Quantity = 60, Price = 34.99m, Status = ProductStatus.InStock, Description = "Men's 7-inch running shorts with pockets", CategoryId = categories[3].Id },
            new() { Name = "Bowflex Dumbbells", Sku = "SPRT-003", Quantity = 14, Price = 599.99m, Status = ProductStatus.InStock, Description = "Adjustable dumbbells 5-52.5 lbs", CategoryId = categories[3].Id },
            new() { Name = "Yeti Rambler Bottle", Sku = "SPRT-004", Quantity = 35, Price = 44.99m, Status = ProductStatus.InStock, Description = "32oz insulated water bottle", CategoryId = categories[3].Id },

            // Books & Media Category (4 products)
            new() { Name = "The Seven Husbands of Evelyn Hugo", Sku = "BOOK-001", Quantity = 28, Price = 16.99m, Status = ProductStatus.InStock, Description = "Bestselling novel by Taylor Jenkins Reid", CategoryId = categories[4].Id },
            new() { Name = "PlayStation 5", Sku = "BOOK-002", Quantity = 0, Price = 499.99m, Status = ProductStatus.OutOfStock, Description = "Next-gen gaming console with 4K gaming", CategoryId = categories[4].Id },
            new() { Name = "Kindle Paperwhite", Sku = "BOOK-003", Quantity = 40, Price = 139.99m, Status = ProductStatus.InStock, Description = "Waterproof e-reader with adjustable warm light", CategoryId = categories[4].Id },
            new() { Name = "Spotify Premium Gift Card", Sku = "BOOK-004", Quantity = 100, Price = 99.99m, Status = ProductStatus.InStock, Description = "12-month subscription gift card", CategoryId = categories[4].Id }
        };

        context.Products.AddRange(products);
        await context.SaveChangesAsync();
    }
}
