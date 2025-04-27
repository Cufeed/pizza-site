using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PizzaWebApp.Data;
using PizzaWebApp.Models.Auth.DTO;
using PizzaWebApp.Models.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using PizzaWebApp.Models.Entities;

namespace PizzaWebApp.Controllers.Auth
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly PizzaDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(PizzaDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(AuthRequest request)
        {
            // Явное приведение к базовому типу
            UserBase user = await _context.Customers
                .FirstOrDefaultAsync(u => u.ContactInfo == request.Identifier) as UserBase;

            user ??= await _context.Employees
                .FirstOrDefaultAsync(u => u.ContactInfo == request.Identifier) as UserBase;

            user ??= await _context.Couriers
                .FirstOrDefaultAsync(u => u.ContactInfo == request.Identifier) as UserBase;

            if (user == null || !PasswordHasher.VerifyPassword(
                request.Password, user.PasswordHash, user.Salt))
                return Unauthorized();

            var token = GenerateJwtToken(user);
            return new AuthResponse { Token = token, Expiration = DateTime.UtcNow.AddHours(2) };
        }

        [HttpPost("register/customer")]
        public async Task<ActionResult<Customer>> RegisterCustomer(CustomerRegistrationDto dto)
        {
            // Проверка на существующего пользователя
            if (await _context.Customers.AnyAsync(c => c.ContactInfo == dto.ContactInfo))
                return BadRequest("Пользователь с таким email уже существует");

            // Хеширование пароля
            var (hash, salt) = PasswordHasher.HashPassword(dto.Password);

            // Создание нового клиента
            var customer = new Customer
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                ContactInfo = dto.ContactInfo,
                PasswordHash = hash,
                Salt = salt,
                Role = "Customer"
            };

            // Сохранение в БД
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            // Возвращаем результат без пароля
            return CreatedAtAction(
                nameof(CustomersController.GetCustomer),
                "Customers",
                new { id = customer.Id },
                new
                {
                    customer.Id,
                    customer.Name,
                    customer.ContactInfo
                });
        }

        [HttpPost("create-admin")]
        public async Task<IActionResult> CreateFirstAdmin(AdminRegistrationDto dto)
        {
            // Проверяем, есть ли уже админы в системе
            var hasExistingAdmin = await _context.Employees
                .AnyAsync(e => e.Role == "Admin");

            if (hasExistingAdmin)
                return BadRequest("Администратор уже существует");

            // Хеширование пароля
            var (hash, salt) = PasswordHasher.HashPassword(dto.Password);

            // Создание администратора
            var admin = new Employee
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                ContactInfo = dto.ContactInfo,
                Position = dto.Position,
                PasswordHash = hash,
                Salt = salt,
                Role = "Admin"
            };

            _context.Employees.Add(admin);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                admin.Id,
                admin.Name,
                admin.ContactInfo,
                admin.Position
            });
        }

        [HttpPost("register/employee")]
        public async Task<ActionResult<Employee>> RegisterEmployee(EmployeeRegistrationDto dto)
        {
            if (await _context.Employees.AnyAsync(e => e.ContactInfo == dto.ContactInfo))
                return BadRequest("Сотрудник с таким email уже существует");

            var (hash, salt) = PasswordHasher.HashPassword(dto.Password);

            var employee = new Employee
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                ContactInfo = dto.ContactInfo,
                Position = dto.Position,
                PasswordHash = hash,
                Salt = salt,
                Role = "Employee"
            };

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(EmployeesController.GetEmployee),
                "Employees",
                new { id = employee.Id },
                new
                {
                    employee.Id,
                    employee.Name,
                    employee.ContactInfo,
                    employee.Position
                });
        }

        [HttpPost("register/courier")]
        public async Task<ActionResult<Courier>> RegisterCourier(CourierRegistrationDto dto)
        {
            if (await _context.Couriers.AnyAsync(c => c.ContactInfo == dto.ContactInfo))
                return BadRequest("Курьер с таким контактом уже существует");

            var (hash, salt) = PasswordHasher.HashPassword(dto.Password);

            var courier = new Courier
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                ContactInfo = dto.ContactInfo,
                MaxCapacity = dto.MaxCapacity,
                PasswordHash = hash,
                Salt = salt,
                Role = "Courier"
            };

            _context.Couriers.Add(courier);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(CouriersController.GetCourier),
                "Couriers",
                new { id = courier.Id },
                new
                {
                    courier.Id,
                    courier.Name,
                    courier.ContactInfo,
                    courier.MaxCapacity
                });
        }

        private string GenerateJwtToken(UserBase user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                _config["Jwt:Issuer"],
                _config["Jwt:Audience"],
                claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
