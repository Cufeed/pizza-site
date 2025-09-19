using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PizzaWebApp.Models.Entities
{
    [Table("sales_statistics")]
    public class SalesStatistic
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("sale_date")]
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public DateTime? SaleDate { get; set; }

        [Column("order_id")]
        public Guid OrderId { get; set; }

        [Column("order_amount")]
        public decimal OrderAmount { get; set; }

        [Column("cost_price")]
        public decimal CostPrice { get; set; }

        [Column("profit")]
        public decimal Profit { get; set; }

        [JsonIgnore]
        public Order? Order { get; set; }
    }
}
