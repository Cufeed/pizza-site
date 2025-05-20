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
    public class OrdersController : ControllerBase
    {
        private readonly PizzaDbContext _context;

        public OrdersController(PizzaDbContext context)
        {
            _context = context;
        }
        [HttpGet]
        [Authorize(Roles = "Admin, Manager, Employee, Courier, Customer")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            //return await _context.Orders
            //    .Include(o => o.Customer)
            //    .Include(o => o.Employee)
            //    .ToListAsync();
            return await _context.Orders
                .Select(o => new Order
                {
                    Id = o.Id,
                    OrderDate = o.OrderDate,
                    Status = o.Status,
                    CustomerId = o.CustomerId,
                    DeliveryAddress = o.DeliveryAddress,
                    EmployeeId = o.EmployeeId
                })
                .ToListAsync();
        }
        [Authorize(Roles = "Admin, Manager, Employee, Courier, Customer")]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Admin, Manager, Courier, Employee")]
        public async Task<ActionResult<Order>> GetOrder(Guid id)
        {
            //var order = await _context.Orders
            //    .Include(o => o.Customer)
            //    .Include(o => o.Employee)
            //    .FirstOrDefaultAsync(o => o.Id == id);
            //        var order = await _context.Orders
            //.FirstOrDefaultAsync(o => o.Id == id);
            var order = await _context.Orders
                .Where(o => o.Id == id)
                .Select(o => new Order
                {
                    Id = o.Id,
                    OrderDate = o.OrderDate,
                    Status = o.Status,
                    CustomerId = o.CustomerId,
                    DeliveryAddress = o.DeliveryAddress,
                    EmployeeId = o.EmployeeId
                })
                .FirstOrDefaultAsync();

            return order == null ? NotFound() : order;
        }

        [HttpPost]
        [Authorize(Roles = "Admin, Manager, Employee, Customer, Courier")]
        public async Task<ActionResult<Order>> PostOrder(Order order)
        {
            order.Id = Guid.NewGuid();
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, Manager, Employee, Courier")]
        public async Task<IActionResult> PutOrder(Guid id, Order order)
        {
            if (id != order.Id) return BadRequest();

            _context.Entry(order).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> DeleteOrder(Guid id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
