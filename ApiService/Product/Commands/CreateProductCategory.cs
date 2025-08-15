namespace ApiService.Product.Commands;

using MediatR;
using Data;
using Models;

public record CreateProductCategoryCommand(string Name, string? Description, bool IsActive = true) : IRequest<int>;

public class CreateProductCategoryHandler(ProductDbContext context) : IRequestHandler<CreateProductCategoryCommand, int>
{
    public async Task<int> Handle(CreateProductCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = new ProductCategory
        {
            Name = request.Name,
            Description = request.Description,
            IsActive = request.IsActive
        };

        context.ProductCategories.Add(entity);

        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
