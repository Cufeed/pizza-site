using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PizzaWebApp.Models.Entities
{
    [Table("ordered_pizzas")]
    public class OrderedPizza
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("order_id")]
        public Guid OrderId { get; set; }

        [Column("pizza_id")]
        public Guid PizzaId { get; set; }

        [Column("quantity")]
        public int Quantity { get; set; }

        [JsonIgnore]
        public Order? Order { get; set; }
        [JsonIgnore]
        public Pizza? Pizza { get; set; }
    }
}
