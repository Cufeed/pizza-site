using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PizzaWebApp.Models.Entities
{
    [Table("promotions")]
    public class Promotion
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("promotion_name")]
        public string PromotionName { get; set; }

        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Column("end_date")]
        public DateTime EndDate { get; set; }

        [Column("conditions")]
        public string Conditions { get; set; }

        [Column("discount_amount")]
        public decimal DiscountAmount { get; set; }

        [Column("pizza_id")]
        public Guid PizzaId { get; set; }

        [JsonIgnore]
        public Pizza? Pizza { get; set; }
    }
}
