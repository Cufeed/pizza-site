using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PizzaWebApp.Models.Entities
{
    [Table("orders")]
    public class Order
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("order_date")]
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public DateTime? OrderDate { get; set; }

        [Column("status")]
        public string Status { get; set; }

        [Column("customer_id")]
        public Guid CustomerId { get; set; }

        [Column("delivery_address")]
        public string DeliveryAddress { get; set; }

        [Column("employee_id")]
        public Guid EmployeeId { get; set; }

        [JsonIgnore]
        public Customer? Customer { get; set; }
        [JsonIgnore]
        public Employee? Employee { get; set; }
        [JsonIgnore]
        public ICollection<OrderedPizza>? OrderedPizzas { get; set; }
        [JsonIgnore]
        public SalesStatistic? SalesStatistic { get; set; }
        [JsonIgnore]
        public ICollection<Review>? Reviews { get; set; }
        [JsonIgnore]
        public ICollection<DeliveryOperation>? DeliveryOperations { get; set; }
    }
}
