using System.ComponentModel.DataAnnotations;

namespace PizzaWebApp.Models.Auth.DTO
{
    namespace PizzaWebApp.Models.Auth.DTO
    {
        public class CourierCapacityDto
        {
            [Required]
            [Range(1, 10)]
            public int MaxCapacity { get; set; }
        }
    }
}
