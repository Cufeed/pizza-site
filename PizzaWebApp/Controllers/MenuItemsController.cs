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
    public class MenuItemsController : ControllerBase
    {
        private readonly PizzaDbContext _context;

        public MenuItemsController(PizzaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MenuItem>>> GetMenuItems()
        {
            //return await _context.Menu
            //    .Include(m => m.Pizza)
            //    .ToListAsync();
            return await _context.Menu
                .Select(m => new MenuItem
                {
                    Id = m.Id,
                    PizzaId = m.PizzaId,
                    Price = m.Price,
                    TotalPrice = m.TotalPrice
                })
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MenuItem>> GetMenuItem(Guid id)
        {
            //var item = await _context.Menu
            //    //.Include(m => m.Pizza)
            //    .FirstOrDefaultAsync(m => m.Id == id);
            var item = await _context.Menu
                .Where(m => m.Id == id)
                .Select(m => new MenuItem
                {
                    Id = m.Id,
                    PizzaId = m.PizzaId,
                    Price = m.Price,
                    TotalPrice = m.TotalPrice
                })
                .FirstOrDefaultAsync();

            return item == null ? NotFound() : item;
        }

        [HttpPost]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<ActionResult<MenuItem>> PostMenuItem(MenuItem item)
        {
            item.Id = Guid.NewGuid();
            if (!await _context.Pizzas.AnyAsync(p => p.Id == item.PizzaId))
                return BadRequest("Invalid Pizza ID");

            _context.Menu.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetMenuItem), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> PutMenuItem(Guid id, MenuItem item)
        {
            if (id != item.Id) return BadRequest();

            _context.Entry(item).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> DeleteMenuItem(Guid id)
        {
            var item = await _context.Menu.FindAsync(id);
            if (item == null) return NotFound();

            _context.Menu.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
