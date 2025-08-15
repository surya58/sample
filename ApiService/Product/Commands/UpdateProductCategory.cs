namespace ApiService.Product.Commands;

using MediatR;
using Data;

public record UpdateProductCategoryCommand(int Id, string Name, string? Description, bool IsActive) : IRequest<Unit>;

public class UpdateProductCategoryCommandHandler(ProductDbContext context) : IRequestHandler<UpdateProductCategoryCommand, Unit>
{
    public async Task<Unit> Handle(UpdateProductCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await context.ProductCategories.FindAsync(request.Id);

        if (category == null)
        {
            return Unit.Value;
        }

        category.Name = request.Name;
        category.Description = request.Description;
        category.IsActive = request.IsActive;

        await context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
