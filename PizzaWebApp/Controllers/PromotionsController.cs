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
    public class PromotionsController : ControllerBase
    {
        private readonly PizzaDbContext _context;

        public PromotionsController(PizzaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Promotion>>> GetPromotions()
        {
            return await _context.Promotions
                .Select(p => new Promotion
                {
                    Id = p.Id,
                    PromotionName = p.PromotionName,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    Conditions = p.Conditions,
                    DiscountAmount = p.DiscountAmount,
                    PizzaId = p.PizzaId
                })
                //.Include(p => p.Pizza)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Promotion>> GetPromotion(Guid id)
        {
            //var promotion = await _context.Promotions
            //    //.Include(p => p.Pizza)
            //    .FirstOrDefaultAsync(p => p.Id == id);
            var promotion = await _context.Promotions
                .Where(p => p.Id == id)
                .Select(p => new Promotion
                {
                    Id = p.Id,
                    PromotionName = p.PromotionName,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    Conditions = p.Conditions,
                    DiscountAmount = p.DiscountAmount,
                    PizzaId = p.PizzaId
                })
                .FirstOrDefaultAsync();

            return promotion == null ? NotFound() : promotion;
        }

        [HttpPost]
        //[Authorize(Roles = "Admin, Manager")]
        public async Task<ActionResult<Promotion>> PostPromotion(Promotion promotion)
        {
            promotion.Id = Guid.NewGuid();
            if (!await _context.Pizzas.AnyAsync(p => p.Id == promotion.PizzaId))
                return BadRequest("Invalid Pizza ID");

            _context.Promotions.Add(promotion);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPromotion), new { id = promotion.Id }, promotion);
        }

        [HttpPut("{id}")]
        //[Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> PutPromotion(Guid id, Promotion promotion)
        {
            if (id != promotion.Id) return BadRequest();

            _context.Entry(promotion).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        //[Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> DeletePromotion(Guid id)
        {
            var promotion = await _context.Promotions.FindAsync(id);
            if (promotion == null) return NotFound();

            _context.Promotions.Remove(promotion);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
