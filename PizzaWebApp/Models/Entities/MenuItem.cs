using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PizzaWebApp.Models.Entities
{
    [Table("menu")]
    public class MenuItem
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("pizza_id")]
        public Guid PizzaId { get; set; }

        [Column("price")]
        public decimal Price { get; set; }

        [Column("total_price")]
        public decimal TotalPrice { get; set; }

        [JsonIgnore]
        public Pizza? Pizza { get; set; }
    }
}
