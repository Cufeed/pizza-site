using Microsoft.EntityFrameworkCore;
using PizzaWebApp.Models.Entities;

namespace PizzaWebApp.Data
{
    public class PizzaDbContext : DbContext
    {
        public PizzaDbContext(DbContextOptions<PizzaDbContext> options) : base(options) { }

        public DbSet<Pizza> Pizzas { get; set; }
        public DbSet<MenuItem> Menu { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Courier> Couriers { get; set; }
        public DbSet<DeliveryOperation> DeliveryOperations { get; set; }
        public DbSet<OrderedPizza> OrderedPizzas { get; set; }
        public DbSet<Promotion> Promotions { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<SalesStatistic> SalesStatistics { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<MenuItem>()
                .HasOne(m => m.Pizza)
                .WithMany(p => p.MenuItems)
                .HasForeignKey(m => m.PizzaId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DeliveryOperation>(entity =>
            {
                entity.HasOne(d => d.Courier)
                    .WithMany(c => c.DeliveryOperations)
                    .HasForeignKey(d => d.CourierId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.Order)
                    .WithMany(o => o.DeliveryOperations)
                    .HasForeignKey(d => d.OrderId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasOne(o => o.Employee)
                    .WithMany(e => e.Orders)
                    .HasForeignKey(o => o.EmployeeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(o => o.Customer)
                    .WithMany(c => c.Orders)
                    .HasForeignKey(o => o.CustomerId);

                entity.HasMany(o => o.OrderedPizzas)
                    .WithOne(op => op.Order)
                    .HasForeignKey(op => op.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<OrderedPizza>()
                .HasOne(op => op.Order)
                .WithMany(o => o.OrderedPizzas)
                .HasForeignKey(op => op.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderedPizza>()
                .HasOne(op => op.Pizza)
                .WithMany(p => p.OrderedPizzas)
                .HasForeignKey(op => op.PizzaId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Customer)
                .WithMany(c => c.Reviews)
                .HasForeignKey(r => r.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Order)
                .WithMany(o => o.Reviews)
                .HasForeignKey(r => r.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Promotion>()
                .HasOne(p => p.Pizza)
                .WithMany(p => p.Promotions)
                .HasForeignKey(p => p.PizzaId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SalesStatistic>()
                .HasOne(ss => ss.Order)
                .WithOne(o => o.SalesStatistic)
                .HasForeignKey<SalesStatistic>(ss => ss.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

        }
    }
}
