namespace ApiService.Product.Models;

public class ProductCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation property for related products
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
