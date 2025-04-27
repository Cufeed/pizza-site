using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PizzaWebApp.Data;
using PizzaWebApp.Models.Entities;
using System.Diagnostics.Metrics;

namespace PizzaWebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PizzasController : ControllerBase
    {
        private readonly PizzaDbContext _context;

        public PizzasController(PizzaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        //[Authorize(Roles = "Admin, Manager")]
        public async Task<ActionResult<IEnumerable<Pizza>>> GetPizzas()
        {
            return await _context.Pizzas
                .Select(p => new Pizza
                {
                    Id = p.Id,
                    Name = p.Name,
                    Ingredients = p.Ingredients,
                    CostPrice = p.CostPrice,
                    Image = p.Image
                })
                .ToListAsync();
        }

        [HttpGet("{id}")]
        //[Authorize(Roles = "Admin, Manager, Employee")]
        public async Task<ActionResult<Pizza>> GetPizza(Guid id)
        {
            //var pizza = await _context.Pizzas.FindAsync(id);
            var pizza = await _context.Pizzas
                .Where(p => p.Id == id)
                .Select(p => new Pizza
                {
                    Id = p.Id,
                    Name = p.Name,
                    Ingredients = p.Ingredients,
                    CostPrice = p.CostPrice,
                    Image = p.Image
                })
                .FirstOrDefaultAsync();

            return pizza == null ? NotFound() : pizza;
        }

        [HttpPost]
        //[Authorize(Roles = "Admin, Manager, Employee")]
        public async Task<ActionResult<Pizza>> PostPizza(Pizza pizza)
        {
            pizza.Id = Guid.NewGuid();
            _context.Pizzas.Add(pizza);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPizza), new { id = pizza.Id }, pizza);
        }

        [HttpPut("{id}")]
        //[Authorize(Roles = "Admin, Manager, Employee")]
        public async Task<IActionResult> PutPizza(Guid id, Pizza pizza)
        {
            if (id != pizza.Id) return BadRequest();

            _context.Entry(pizza).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        //[Authorize(Roles = "Admin, Manager, Employee")]
        public async Task<IActionResult> DeletePizza(Guid id)
        {
            var pizza = await _context.Pizzas.FindAsync(id);
            if (pizza == null) return NotFound();

            _context.Pizzas.Remove(pizza);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
