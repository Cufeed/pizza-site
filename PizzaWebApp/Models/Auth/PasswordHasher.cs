using System.Security.Cryptography;

namespace PizzaWebApp.Models.Auth
{
    public class PasswordHasher
    {
        public static (string Hash, string Salt) HashPassword(string password)
        {
            using var deriveBytes = new Rfc2898DeriveBytes(password, 128 / 8, 10000);
            var salt = Convert.ToBase64String(deriveBytes.Salt);
            var hash = Convert.ToBase64String(deriveBytes.GetBytes(256 / 8));
            return (hash, salt);
        }

        public static bool VerifyPassword(string password, string hash, string salt)
        {
            var saltBytes = Convert.FromBase64String(salt);
            using var deriveBytes = new Rfc2898DeriveBytes(password, saltBytes, 10000);
            var newHash = Convert.ToBase64String(deriveBytes.GetBytes(256 / 8));
            return newHash == hash;
        }
    }
}
