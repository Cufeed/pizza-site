using System.ComponentModel.DataAnnotations;

namespace PizzaWebApp.Models.Auth.DTO
{
    public class AuthRequest
    {
        [Required]
        public string Identifier { get; set; } // email или телефон

        [Required]
        public string Password { get; set; }
    }
    public class AuthResponse
    {
        public string Token { get; set; }
        public DateTime Expiration { get; set; }
    }
}
