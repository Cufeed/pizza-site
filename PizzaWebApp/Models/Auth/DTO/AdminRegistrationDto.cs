using System.ComponentModel.DataAnnotations;

namespace PizzaWebApp.Models.Auth.DTO
{
    public class AdminRegistrationDto
    {
        [Required]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string ContactInfo { get; set; }

        [Required]
        [MinLength(8)]
        public string Password { get; set; }

        [Required]
        public string Position { get; set; }
    }
}
