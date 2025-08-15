namespace ApiService.Controllers;

using MediatR;
using Microsoft.AspNetCore.Mvc;
using ApiService.Product.Commands;
using ApiService.Product.Queries;
using ApiService.Product.DTO;

[ApiController]
[Route("api/[controller]")]
public class ProductCategoriesController(IMediator mediator) : ControllerBase
{
    [HttpGet(Name = nameof(GetProductCategories))]
    public async Task<IEnumerable<ProductCategoryItem>> GetProductCategories()
    {
        return await mediator.Send(new GetProductCategoriesQuery());
    }

    [HttpGet("{id}", Name = nameof(GetProductCategoryById))]
    public async Task<ActionResult<ProductCategoryDetail>> GetProductCategoryById(int id)
    {
        var category = await mediator.Send(new GetProductCategoryByIdQuery(id));
        
        if (category == null)
        {
            return NotFound();
        }
        
        return category;
    }

    [HttpGet("{id}/products", Name = nameof(GetProductsInCategory))]
    public async Task<IEnumerable<ProductItem>> GetProductsInCategory(int id)
    {
        return await mediator.Send(new GetProductsByCategoryQuery(id));
    }

    [HttpPost(Name = nameof(CreateProductCategory))]
    public async Task<ActionResult<int>> CreateProductCategory(CreateProductCategoryCommand command)
    {
        return await mediator.Send(command);
    }

    [HttpPut("{id}", Name = nameof(UpdateProductCategory))]
    public async Task<IActionResult> UpdateProductCategory(int id, UpdateProductCategoryCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest();
        }

        await mediator.Send(command);

        return NoContent();
    }

    [HttpDelete("{id}", Name = nameof(DeleteProductCategory))]
    public async Task<IActionResult> DeleteProductCategory(int id)
    {
        await mediator.Send(new DeleteProductCategoryCommand(id));

        return NoContent();
    }
}
