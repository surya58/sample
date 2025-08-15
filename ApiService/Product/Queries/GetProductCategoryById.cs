namespace ApiService.Product.Queries;

using MediatR;
using Microsoft.EntityFrameworkCore;
using Data;
using DTO;

public record GetProductCategoryByIdQuery(int Id) : IRequest<ProductCategoryDetail?>;

public class GetProductCategoryByIdQueryHandler(ProductDbContext context) : IRequestHandler<GetProductCategoryByIdQuery, ProductCategoryDetail?>
{
    public async Task<ProductCategoryDetail?> Handle(GetProductCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        return await context.ProductCategories
            .Where(c => c.Id == request.Id)
            .Select(c => new ProductCategoryDetail 
            { 
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                IsActive = c.IsActive,
                Products = c.Products.Select(p => new ProductItem
                {
                    Id = p.Id,
                    Name = p.Name,
                    Sku = p.Sku,
                    Quantity = p.Quantity,
                    Price = p.Price,
                    Status = p.Status,
                    Description = p.Description,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category != null ? p.Category.Name : null
                }).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);
    }
}
