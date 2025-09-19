using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PizzaWebApp.Models.Entities
{
    [Table("pizzas")]
    public class Pizza
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("name")]
        public string Name { get; set; }

        [Column("ingredients")]
        public string Ingredients { get; set; }

        [Column("cost_price")]
        public decimal CostPrice { get; set; }
        [Column("image")]
        public string Image { get; set; }
        //public MenuItem MenuItem { get; set; }
        [JsonIgnore]
        public List<OrderedPizza>? OrderedPizzas { get; set; }
        [JsonIgnore]
        public List<Promotion>? Promotions { get; set; }
        [JsonIgnore]
        public ICollection<MenuItem>? MenuItems { get; set; }
    }
}
