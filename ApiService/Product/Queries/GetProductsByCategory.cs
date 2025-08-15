namespace ApiService.Product.Queries;

using MediatR;
using Microsoft.EntityFrameworkCore;
using Data;
using DTO;

public record GetProductsByCategoryQuery(int CategoryId) : IRequest<IEnumerable<ProductItem>>;

public class GetProductsByCategoryQueryHandler(ProductDbContext context) : IRequestHandler<GetProductsByCategoryQuery, IEnumerable<ProductItem>>
{
    public async Task<IEnumerable<ProductItem>> Handle(GetProductsByCategoryQuery request, CancellationToken cancellationToken)
    {
        return await context.Products
            .Where(p => p.CategoryId == request.CategoryId)
            .Select(p => new ProductItem 
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
            })
            .ToListAsync(cancellationToken);
    }
}
