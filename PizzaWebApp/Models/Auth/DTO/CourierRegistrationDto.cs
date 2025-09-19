using System.ComponentModel.DataAnnotations;

namespace PizzaWebApp.Models.Auth.DTO
{
    public class CourierRegistrationDto
    {
        [Required]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string ContactInfo { get; set; }

        [Required]
        [Range(1, 10)]
        public int MaxCapacity { get; set; }

        [Required]
        [MinLength(8)]
        public string Password { get; set; }

        //[Required]
        //public string Role { get; set; } = "Courier";
    }
}
