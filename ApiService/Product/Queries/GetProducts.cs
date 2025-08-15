namespace ApiService.Product.Queries;

using MediatR;
using Microsoft.EntityFrameworkCore;
using Data;
using DTO;

public record GetProductsQuery : IRequest<IEnumerable<ProductItem>>;

public class GetProductsQueryHandler(ProductDbContext context) : IRequestHandler<GetProductsQuery, IEnumerable<ProductItem>>
{
    public async Task<IEnumerable<ProductItem>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        return await context.Products
            .Include(p => p.Category)
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
