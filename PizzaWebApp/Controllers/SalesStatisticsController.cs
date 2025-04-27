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
    public class SalesStatisticsController : ControllerBase
    {
        private readonly PizzaDbContext _context;

        public SalesStatisticsController(PizzaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SalesStatistic>>> GetSalesStatistics()
        {
            return await _context.SalesStatistics
                .Select(s => new SalesStatistic
                {
                    Id = s.Id,
                    SaleDate = s.SaleDate,
                    OrderId = s.OrderId,
                    OrderAmount = s.OrderAmount,
                    CostPrice = s.CostPrice,
                    Profit = s.Profit
                })
                //.Include(s => s.Order)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<ActionResult<SalesStatistic>> GetSalesStatistic(Guid id)
        {
            //var statistic = await _context.SalesStatistics
            //    //.Include(s => s.Order)
            //    .FirstOrDefaultAsync(s => s.Id == id);
            var statistic = await _context.SalesStatistics
                .Where(s => s.Id == id)
                .Select(s => new SalesStatistic
                {
                    Id = s.Id,
                    SaleDate = s.SaleDate,
                    OrderId = s.OrderId,
                    OrderAmount = s.OrderAmount,
                    CostPrice = s.CostPrice,
                    Profit = s.Profit
                })
                .FirstOrDefaultAsync();

            return statistic == null ? NotFound() : statistic;
        }

        [HttpPost]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<ActionResult<SalesStatistic>> PostSalesStatistic(SalesStatistic statistic)
        {
            statistic.Id = Guid.NewGuid();
            //if (!await _context.Orders.AnyAsync(o => o.Id == statistic.OrderId))
            //    return BadRequest("Invalid Order ID");

            _context.SalesStatistics.Add(statistic);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSalesStatistic), new { id = statistic.Id }, statistic);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> PutSalesStatistic(Guid id, SalesStatistic statistic)
        {
            if (id != statistic.Id) return BadRequest();

            _context.Entry(statistic).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> DeleteSalesStatistic(Guid id)
        {
            var statistic = await _context.SalesStatistics.FindAsync(id);
            if (statistic == null) return NotFound();

            _context.SalesStatistics.Remove(statistic);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
