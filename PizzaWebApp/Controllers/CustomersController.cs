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
    public class CustomersController : ControllerBase
    {
        private readonly PizzaDbContext _context;

        public CustomersController(PizzaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin, Manager, Courier")]
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
        {
            return await _context.Customers.Select(c => new Customer
            {
                Id = c.Id,
                Name = c.Name,
                ContactInfo = c.ContactInfo
            })
            .ToListAsync();
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin, Manager, Customer, Courier")]
        public async Task<ActionResult<Customer>> GetCustomer(Guid id)
        {
            //var customer = await _context.Customers.FindAsync(id);
            var customer = await _context.Customers
               .Where(c => c.Id == id)
               .Select(c => new Customer
               {
                   Id = c.Id,
                   Name = c.Name,
                   ContactInfo = c.ContactInfo
               })
               .FirstOrDefaultAsync();


            return customer == null ? NotFound() : customer;
        }

        [HttpPost]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<ActionResult<Customer>> PostCustomer(Customer customer)
        {
            customer.Id = Guid.NewGuid();
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> PutCustomer(Guid id, Customer customer)
        {
            if (id != customer.Id) return BadRequest();

            _context.Entry(customer).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> DeleteCustomer(Guid id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound();

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
