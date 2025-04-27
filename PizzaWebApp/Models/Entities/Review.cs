using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PizzaWebApp.Models.Entities
{
    [Table("reviews")]
    public class Review
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("review_text")]
        public string ReviewText { get; set; }

        [Column("rating")]
        public int Rating { get; set; }

        [Column("review_date")]
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public DateTime? ReviewDate { get; set; }

        [Column("customer_id")]
        public Guid CustomerId { get; set; }

        [Column("order_id")]
        public Guid OrderId { get; set; }

        [JsonIgnore]
        public Customer? Customer { get; set; }
        [JsonIgnore]
        public Order? Order { get; set; }
    }
}
