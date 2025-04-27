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
    public class ReviewsController : ControllerBase
    {
        private readonly PizzaDbContext _context;

        public ReviewsController(PizzaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviews()
        {
            return await _context.Reviews
                .Select(r => new Review
                {
                    Id = r.Id,
                    ReviewText = r.ReviewText,
                    Rating = r.Rating,
                    ReviewDate = r.ReviewDate,
                    CustomerId = r.CustomerId,
                    OrderId = r.OrderId
                })
                //.Include(r => r.Customer)
                //.Include(r => r.Order)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Review>> GetReview(Guid id)
        {
            //var review = await _context.Reviews
            //    //.Include(r => r.Customer)
            //    //.Include(r => r.Order)
            //    .FirstOrDefaultAsync(r => r.Id == id);
            var review = await _context.Reviews
                .Where(r => r.Id == id)
                .Select(r => new Review
                {
                    Id = r.Id,
                    ReviewText = r.ReviewText,
                    Rating = r.Rating,
                    ReviewDate = r.ReviewDate,
                    CustomerId = r.CustomerId,
                    OrderId = r.OrderId
                })
                .FirstOrDefaultAsync();

            return review == null ? NotFound() : review;
        }

        [HttpPost]
        [Authorize(Roles = "Admin, Manager, Customer, Courier, Employee")]
        public async Task<ActionResult<Review>> PostReview(Review review)
        {
            review.Id = Guid.NewGuid();
            if (!await _context.Customers.AnyAsync(c => c.Id == review.CustomerId))
                return BadRequest("Invalid Customer ID");

            if (!await _context.Orders.AnyAsync(o => o.Id == review.OrderId))
                return BadRequest("Invalid Order ID");

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetReview), new { id = review.Id }, review);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, Manager, Customer, Courier, Employee")]
        public async Task<IActionResult> PutReview(Guid id, Review review)
        {
            if (id != review.Id) return BadRequest();

            _context.Entry(review).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        //[Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> DeleteReview(Guid id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound();

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
