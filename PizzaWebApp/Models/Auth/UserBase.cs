using System.ComponentModel.DataAnnotations.Schema;

namespace PizzaWebApp.Models.Auth
{
    public abstract class UserBase
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("password_hash")]
        public string PasswordHash { get; set; }

        [Column("salt")]
        public string Salt { get; set; }

        [Column("role")]
        public string Role { get; set; }
    }
}
