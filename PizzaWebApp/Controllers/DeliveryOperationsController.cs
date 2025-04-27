using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PizzaWebApp.Data;
using PizzaWebApp.Models.Entities;

namespace PizzaWebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DeliveryOperationsController : ControllerBase
    {
        private readonly PizzaDbContext _context;

        public DeliveryOperationsController(PizzaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<ActionResult<IEnumerable<DeliveryOperation>>> GetDeliveryOperations()
        {
            return await _context.DeliveryOperations
                .Select(d => new DeliveryOperation
                {
                    Id = d.Id,
                    DeliveryDate = d.DeliveryDate,
                    CourierId = d.CourierId,
                    OrderId = d.OrderId,
                    Status = d.Status
                })
                //.Include(d => d.Courier)
                //.Include(d => d.Order)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin, Manager, Courier, Customer")]
        public async Task<ActionResult<DeliveryOperation>> GetDeliveryOperation(Guid id)
        {
            //var operation = await _context.DeliveryOperations
            //    //.Include(d => d.Courier)
            //    //.Include(d => d.Order)
            //    .FirstOrDefaultAsync(d => d.Id == id);
            var operation = await _context.DeliveryOperations
                .Where(d => d.Id == id)
                .Select(d => new DeliveryOperation
                {
                    Id = d.Id,
                    DeliveryDate = d.DeliveryDate,
                    CourierId = d.CourierId,
                    OrderId = d.OrderId,
                    Status = d.Status
                })
                .FirstOrDefaultAsync();

            return operation == null ? NotFound() : operation;
        }

        [HttpPost]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<ActionResult<DeliveryOperation>> PostDeliveryOperation(DeliveryOperation operation)
        {
            operation.Id = Guid.NewGuid();
            if (!await _context.Couriers.AnyAsync(c => c.Id == operation.CourierId))
                return BadRequest("Invalid Courier ID");

            if (!await _context.Orders.AnyAsync(o => o.Id == operation.OrderId))
                return BadRequest("Invalid Order ID");

            _context.DeliveryOperations.Add(operation);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetDeliveryOperation), new { id = operation.Id }, operation);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, Manager, Courier")]
        public async Task<IActionResult> PutDeliveryOperation(Guid id, DeliveryOperation operation)
        {
            if (id != operation.Id) return BadRequest();

            _context.Entry(operation).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> DeleteDeliveryOperation(Guid id)
        {
            var operation = await _context.DeliveryOperations.FindAsync(id);
            if (operation == null) return NotFound();

            _context.DeliveryOperations.Remove(operation);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
