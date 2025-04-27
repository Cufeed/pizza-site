using PizzaWebApp.Models.Auth;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PizzaWebApp.Models.Entities
{
    [Table("employees")]
    public class Employee : UserBase
    {
        //[Column("id")]
        //public Guid Id { get; set; }

        [Column("name")]
        public string Name { get; set; }

        [Column("contact_info")]
        public string ContactInfo { get; set; }

        [Column("position")]
        public string Position { get; set; }

        [JsonIgnore]
        public ICollection<Order>? Orders { get; set; }
    }
}
