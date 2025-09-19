using PizzaWebApp.Models.Auth;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PizzaWebApp.Models.Entities
{
    [Table("couriers")]
    public class Courier : UserBase
    {
        //[Column("id")]
        //public Guid Id { get; set; }

        [Column("name")]
        public string Name { get; set; }

        [Column("contact_info")]
        public string ContactInfo { get; set; }

        [Column("max_capacity")]
        public int MaxCapacity { get; set; }
        [JsonIgnore]
        public ICollection<DeliveryOperation>? DeliveryOperations { get; set; }
    }
}
