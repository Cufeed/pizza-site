using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PizzaWebApp.Data;
using PizzaWebApp.Models.Auth.DTO.PizzaWebApp.Models.Auth.DTO;
using PizzaWebApp.Models.Entities;

namespace PizzaWebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CouriersController : ControllerBase
    {
        private readonly PizzaDbContext _context;

        public CouriersController(PizzaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin, Manager, Courier")]
        public async Task<ActionResult<IEnumerable<Courier>>> GetCouriers()
        {
            return await _context.Couriers.Select(c => new Courier
            {
                Id = c.Id,
                Name = c.Name,
                ContactInfo = c.ContactInfo,
                MaxCapacity = c.MaxCapacity
            })
            .ToListAsync();
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin, Manager, Courier")]
        public async Task<ActionResult<Courier>> GetCourier(Guid id)
        {
            //var courier = await _context.Couriers.FindAsync(id);
            var courier = await _context.Couriers.Where(c => c.Id == id)
            .Select(c => new Courier
            {
                Id = c.Id,
                Name = c.Name,
                ContactInfo = c.ContactInfo,
                MaxCapacity = c.MaxCapacity
            })
            .FirstOrDefaultAsync();


            return courier == null ? NotFound() : courier;
        }

        [HttpPost]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<ActionResult<Courier>> PostCourier(Courier courier)
        {
            courier.Id = Guid.NewGuid();
            _context.Couriers.Add(courier);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCourier), new { id = courier.Id }, courier);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> PutCourier(Guid id, Courier courier)
        {
            if (id != courier.Id) return BadRequest();

            _context.Entry(courier).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id}/capacity")]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> UpdateCourierCapacity(Guid id, [FromBody] CourierCapacityDto dto)
        {
            var courier = await _context.Couriers.FindAsync(id);
            if (courier == null) return NotFound();

            courier.MaxCapacity = dto.MaxCapacity;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> DeleteCourier(Guid id)
        {
            var courier = await _context.Couriers.FindAsync(id);
            if (courier == null) return NotFound();

            _context.Couriers.Remove(courier);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
