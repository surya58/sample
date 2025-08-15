namespace ApiService.Product.Commands;

using MediatR;
using Data;

public record UpdateInventoryCommand(int Id, int Quantity) : IRequest<Unit>;

public class UpdateInventoryCommandHandler(ProductDbContext context) : IRequestHandler<UpdateInventoryCommand, Unit>
{
    public async Task<Unit> Handle(UpdateInventoryCommand request, CancellationToken cancellationToken)
    {
        var product = await context.Products.FindAsync(request.Id);

        if (product == null)
        {
            // Handle not found
            return Unit.Value;
        }

        product.Quantity = request.Quantity;

        await context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
