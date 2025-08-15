namespace ApiService.Product.Commands;

using MediatR;
using Data;

public record DeleteProductCommand(int Id) : IRequest<Unit>;

public class DeleteProductCommandHandler(ProductDbContext context) : IRequestHandler<DeleteProductCommand, Unit>
{
    public async Task<Unit> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var product = await context.Products.FindAsync(request.Id);

        if (product == null)
        {
            // Handle not found
            return Unit.Value;
        }

        context.Products.Remove(product);

        await context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
