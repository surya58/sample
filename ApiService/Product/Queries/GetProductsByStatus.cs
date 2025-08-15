namespace ApiService.Product.Queries;

using MediatR;
using Microsoft.EntityFrameworkCore;
using Data;
using DTO;
using Models;

public record GetProductsByStatusQuery(ProductStatus Status) : IRequest<IEnumerable<ProductItem>>;

public class GetProductsByStatusQueryHandler(ProductDbContext context) : IRequestHandler<GetProductsByStatusQuery, IEnumerable<ProductItem>>
{
    public async Task<IEnumerable<ProductItem>> Handle(GetProductsByStatusQuery request, CancellationToken cancellationToken)
    {
        return await context.Products
            .Include(p => p.Category)
            .Where(x => x.Status == request.Status)
            .Select(x => new ProductItem 
            { 
                Id = x.Id, 
                Name = x.Name, 
                Sku = x.Sku,
                Quantity = x.Quantity,
                Price = x.Price,
                Status = x.Status,
                Description = x.Description,
                CategoryId = x.CategoryId,
                CategoryName = x.Category != null ? x.Category.Name : null
            })
            .ToListAsync(cancellationToken);
    }
}
