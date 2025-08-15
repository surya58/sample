namespace ApiService.Product.Queries;

using MediatR;
using Microsoft.EntityFrameworkCore;
using Data;
using DTO;

public record GetProductBySkuQuery(string Sku) : IRequest<ProductItem?>;

public class GetProductBySkuQueryHandler(ProductDbContext context) : IRequestHandler<GetProductBySkuQuery, ProductItem?>
{
    public async Task<ProductItem?> Handle(GetProductBySkuQuery request, CancellationToken cancellationToken)
    {
        return await context.Products
            .Include(p => p.Category)
            .Where(x => x.Sku == request.Sku)
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
            .FirstOrDefaultAsync(cancellationToken);
    }
}
