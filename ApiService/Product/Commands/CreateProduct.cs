namespace ApiService.Product.Commands;

using MediatR;
using ApiService.Data;
using ApiService.Product.Models;

public record CreateProductCommand(string Name, string Sku, int Quantity, decimal Price, ProductStatus Status, string? Description, int? CategoryId = null) : IRequest<int>;

public class CreateProductHandler(ProductDbContext context) : IRequestHandler<CreateProductCommand, int>
{
    public async Task<int> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var entity = new Product
        {
            Name = request.Name,
            Sku = request.Sku,
            Quantity = request.Quantity,
            Price = request.Price,
            Status = request.Status,
            Description = request.Description,
            CategoryId = request.CategoryId
        };

        context.Products.Add(entity);

        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
