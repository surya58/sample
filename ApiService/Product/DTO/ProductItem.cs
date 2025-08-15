namespace ApiService.Product.DTO;

using Models;

public class ProductItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public ProductStatus Status { get; set; }
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
}
