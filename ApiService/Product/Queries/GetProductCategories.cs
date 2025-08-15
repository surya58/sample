namespace ApiService.Product.Queries;

using MediatR;
using Microsoft.EntityFrameworkCore;
using Data;
using DTO;

public record GetProductCategoriesQuery : IRequest<IEnumerable<ProductCategoryItem>>;

public class GetProductCategoriesQueryHandler(ProductDbContext context) : IRequestHandler<GetProductCategoriesQuery, IEnumerable<ProductCategoryItem>>
{
    public async Task<IEnumerable<ProductCategoryItem>> Handle(GetProductCategoriesQuery request, CancellationToken cancellationToken)
    {
        return await context.ProductCategories
            .Select(c => new ProductCategoryItem 
            { 
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                IsActive = c.IsActive,
                ProductCount = c.Products.Count()
            })
            .ToListAsync(cancellationToken);
    }
}
