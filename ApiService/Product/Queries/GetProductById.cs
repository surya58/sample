namespace ApiService.Product.Queries;

using MediatR;
using Microsoft.EntityFrameworkCore;
using Data;
using DTO;

public record GetProductByIdQuery(int Id) : IRequest<ProductItem?>;

public class GetProductByIdQueryHandler(ProductDbContext context) : IRequestHandler<GetProductByIdQuery, ProductItem?>
{
    public async Task<ProductItem?> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        return await context.Products
            .Include(p => p.Category)
            .Where(x => x.Id == request.Id)
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
