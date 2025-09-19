using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PizzaWebApp.Models.Entities
{
    [Table("delivery_operations")]
    public class DeliveryOperation
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("delivery_date")]
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public DateTime DeliveryDate { get; set; }

        [Column("courier_id")]
        public Guid CourierId { get; set; }

        [Column("order_id")]
        public Guid OrderId { get; set; }

        [Column("status")]
        public string Status { get; set; }

        [ForeignKey("CourierId")]
        [JsonIgnore]
        public Courier? Courier { get; set; }

        [ForeignKey("OrderId")]
        [JsonIgnore]
        public Order? Order { get; set; }
    }
}
