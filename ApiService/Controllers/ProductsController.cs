namespace ApiService.Controllers;

using MediatR;
using Microsoft.AspNetCore.Mvc;
using ApiService.Product.Commands;
using ApiService.Product.Queries;
using ApiService.Product.DTO;
using ApiService.Product.Models;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(IMediator mediator) : ControllerBase
{
    [HttpGet(Name = nameof(GetProducts))]
    public async Task<IEnumerable<ProductItem>> GetProducts()
    {
        return await mediator.Send(new GetProductsQuery());
    }

    [HttpGet("{id}", Name = nameof(GetProductById))]
    public async Task<ActionResult<ProductItem>> GetProductById(int id)
    {
        var product = await mediator.Send(new GetProductByIdQuery(id));
        
        if (product == null)
        {
            return NotFound();
        }
        
        return product;
    }

    [HttpGet("sku/{sku}", Name = nameof(GetProductBySku))]
    public async Task<ActionResult<ProductItem>> GetProductBySku(string sku)
    {
        var product = await mediator.Send(new GetProductBySkuQuery(sku));
        
        if (product == null)
        {
            return NotFound();
        }
        
        return product;
    }

    [HttpGet("status/{status}", Name = nameof(GetProductsByStatus))]
    public async Task<IEnumerable<ProductItem>> GetProductsByStatus(ProductStatus status)
    {
        return await mediator.Send(new GetProductsByStatusQuery(status));
    }

    [HttpGet("category/{categoryId}", Name = nameof(GetProductsByCategory))]
    public async Task<IEnumerable<ProductItem>> GetProductsByCategory(int categoryId)
    {
        return await mediator.Send(new GetProductsByCategoryQuery(categoryId));
    }

    [HttpPost(Name = nameof(CreateProduct))]
    public async Task<ActionResult<int>> CreateProduct(CreateProductCommand command)
    {
        return await mediator.Send(command);
    }

    [HttpPut("{id}", Name = nameof(UpdateProduct))]
    public async Task<IActionResult> UpdateProduct(int id, UpdateProductCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest();
        }

        await mediator.Send(command);

        return NoContent();
    }

    [HttpPatch("{id}/inventory", Name = nameof(UpdateInventory))]
    public async Task<IActionResult> UpdateInventory(int id, UpdateInventoryCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest();
        }

        await mediator.Send(command);

        return NoContent();
    }

    [HttpDelete("{id}", Name = nameof(DeleteProduct))]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        await mediator.Send(new DeleteProductCommand(id));

        return NoContent();
    }
}
