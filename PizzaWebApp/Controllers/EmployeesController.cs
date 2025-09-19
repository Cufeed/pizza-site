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
    public class EmployeesController : ControllerBase
    {
        private readonly PizzaDbContext _context;

        public EmployeesController(PizzaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin, Manager, Employee, Customer")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
        {
            return await _context.Employees
                .Select(e => new Employee
                {
                    Id = e.Id,
                    Name = e.Name,
                    ContactInfo = e.ContactInfo,
                    Position = e.Position
                })
                .ToListAsync();
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin, Manager, Employee, Customer")]
        public async Task<ActionResult<Employee>> GetEmployee(Guid id)
        {
            //var employee = await _context.Employees.FindAsync(id);
            var employee = await _context.Employees
                .Where(e => e.Id == id)
                .Select(e => new Employee
                {
                    Id = e.Id,
                    Name = e.Name,
                    ContactInfo = e.ContactInfo,
                    Position = e.Position
                })
                .FirstOrDefaultAsync();

            return employee == null ? NotFound() : employee;
        }

        [HttpGet("{id}/role")]
        [Authorize(Roles = "Admin, Manager, Employee, Customer")]
        public async Task<ActionResult<object>> GetEmployeeRole(Guid id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return NotFound();

            return new { role = employee.Role };
        }

        [HttpPost]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<ActionResult<Employee>> PostEmployee(Employee employee)
        {
            employee.Id = Guid.NewGuid();
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> PutEmployee(Guid id, Employee employee)
        {
            if (id != employee.Id) return BadRequest();

            _context.Entry(employee).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id}/position")]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> UpdatePosition(Guid id, [FromBody] PositionUpdateDto positionDto)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return NotFound();

            employee.Position = positionDto.Position;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id}/role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateRole(Guid id, [FromBody] RoleUpdateDto roleDto)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return NotFound();

            employee.Role = roleDto.Role;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        public class RoleUpdateDto
        {
            public string Role { get; set; }
        }

        public class PositionUpdateDto
        {
            public string Position { get; set; }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> DeleteEmployee(Guid id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return NotFound();

            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
