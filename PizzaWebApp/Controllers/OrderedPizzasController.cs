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
    public class OrderedPizzasController : ControllerBase
    {
        private readonly PizzaDbContext _context;

        public OrderedPizzasController(PizzaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        //[Authorize(Roles = "Admin, Manager")]
        public async Task<ActionResult<IEnumerable<OrderedPizza>>> GetOrderedPizzas()
        {
            //return await _context.OrderedPizzas
            //    .Include(op => op.Order)
            //    .Include(op => op.Pizza)
            //    .ToListAsync();
            return await _context.OrderedPizzas
                .Select(op => new OrderedPizza
                {
                    Id = op.Id,
                    OrderId = op.OrderId,
                    PizzaId = op.PizzaId,
                    Quantity = op.Quantity
                })
                .ToListAsync();
        }

        [HttpGet("{id}")]
        //[Authorize(Roles = "Admin, Manager, Employee")]
        public async Task<ActionResult<OrderedPizza>> GetOrderedPizza(Guid id)
        {
            //var orderedPizza = await _context.OrderedPizzas
            //    //.Include(op => op.Order)
            //    //.Include(op => op.Pizza)
            //    .FirstOrDefaultAsync(op => op.Id == id);
            var orderedPizza = await _context.OrderedPizzas
                .Where(op => op.Id == id)
                .Select(op => new OrderedPizza
                {
                    Id = op.Id,
                    OrderId = op.OrderId,
                    PizzaId = op.PizzaId,
                    Quantity = op.Quantity
                })
                .FirstOrDefaultAsync();

            return orderedPizza == null ? NotFound() : orderedPizza;
        }

        [HttpGet("order/{orderId}")]

        public async Task<ActionResult<IEnumerable<OrderedPizza>>> GetOrderedPizzasByOrderId(Guid orderId)
        {
            var orderedPizzas = await _context.OrderedPizzas
                .Where(op => op.OrderId == orderId)
                .Select(op => new OrderedPizza
                {
                    Id = op.Id,
                    OrderId = op.OrderId,
                    PizzaId = op.PizzaId,
                    Quantity = op.Quantity
                })
                .ToListAsync();

            if (!orderedPizzas.Any())
            {
                return NotFound();
            }

            return orderedPizzas;
        }

        [HttpPost]
        //[Authorize(Roles = "Admin, Manager")]
        public async Task<ActionResult<OrderedPizza>> PostOrderedPizza(OrderedPizza orderedPizza)
        {
            orderedPizza.Id = Guid.NewGuid();
            if (!await _context.Orders.AnyAsync(o => o.Id == orderedPizza.OrderId))
                return BadRequest("Invalid Order ID");

            if (!await _context.Pizzas.AnyAsync(p => p.Id == orderedPizza.PizzaId))
                return BadRequest("Invalid Pizza ID");

            _context.OrderedPizzas.Add(orderedPizza);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetOrderedPizza), new { id = orderedPizza.Id }, orderedPizza);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> PutOrderedPizza(Guid id, OrderedPizza orderedPizza)
        {
            if (id != orderedPizza.Id) return BadRequest();

            _context.Entry(orderedPizza).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> DeleteOrderedPizza(Guid id)
        {
            var orderedPizza = await _context.OrderedPizzas.FindAsync(id);
            if (orderedPizza == null) return NotFound();

            _context.OrderedPizzas.Remove(orderedPizza);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
