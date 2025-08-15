namespace ApiService.Product.Commands;

using MediatR;
using Data;

public record DeleteProductCategoryCommand(int Id) : IRequest<Unit>;

public class DeleteProductCategoryCommandHandler(ProductDbContext context) : IRequestHandler<DeleteProductCategoryCommand, Unit>
{
    public async Task<Unit> Handle(DeleteProductCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await context.ProductCategories.FindAsync(request.Id);

        if (category == null)
        {
            return Unit.Value;
        }

        context.ProductCategories.Remove(category);

        await context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
