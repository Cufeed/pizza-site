using PizzaWebApp.Models.Auth;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PizzaWebApp.Models.Entities
{
    [Table("customers")]
    public class Customer : UserBase
    {
        //[Column("id")]
        //public Guid Id { get; set; }

        [Column("name")]
        public string Name { get; set; }

        [Column("contact_info")]
        public string ContactInfo { get; set; }
        //public List<Order> Orders { get; set; }
        [JsonIgnore]
        public ICollection<Order>? Orders { get; set; }
        [JsonIgnore]
        public List<Review>? Reviews { get; set; }
    }
}
