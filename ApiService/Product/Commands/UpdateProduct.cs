namespace ApiService.Product.Commands;

using MediatR;
using Data;
using Models;

public record UpdateProductCommand(int Id, string Name, string Sku, int Quantity, decimal Price, ProductStatus Status, string? Description, int? CategoryId = null) : IRequest<Unit>;

public class UpdateProductCommandHandler(ProductDbContext context) : IRequestHandler<UpdateProductCommand, Unit>
{
    public async Task<Unit> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await context.Products.FindAsync(request.Id);

        if (product == null)
        {
            // Handle not found
            return Unit.Value;
        }

        product.Name = request.Name;
        product.Sku = request.Sku;
        product.Quantity = request.Quantity;
        product.Price = request.Price;
        product.Status = request.Status;
        product.Description = request.Description;
        product.CategoryId = request.CategoryId;

        await context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
