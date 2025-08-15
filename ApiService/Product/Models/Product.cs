namespace ApiService.Product.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public ProductStatus Status { get; set; }
    public string? Description { get; set; }
    
    // Foreign key for ProductCategory
    public int? CategoryId { get; set; }
    
    // Navigation property
    public virtual ProductCategory? Category { get; set; }
}

public enum ProductStatus
{
    InStock,
    OutOfStock,
    Discontinued,
    PreOrder
}
