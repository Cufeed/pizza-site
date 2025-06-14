﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using PizzaWebApp.Data;

#nullable disable

namespace PizzaWebApp.Migrations
{
    [DbContext(typeof(PizzaDbContext))]
    partial class PizzaDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.2")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("PizzaWebApp.Models.Entities.Courier", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<string>("ContactInfo")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("contact_info");

                    b.Property<int>("MaxCapacity")
                        .HasColumnType("integer")
                        .HasColumnName("max_capacity");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("name");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("password_hash");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("role");

                    b.Property<string>("Salt")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("salt");

                    b.HasKey("Id");

                    b.ToTable("couriers");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.Customer", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<string>("ContactInfo")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("contact_info");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("name");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("password_hash");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("role");

                    b.Property<string>("Salt")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("salt");

                    b.HasKey("Id");

                    b.ToTable("customers");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.DeliveryOperation", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<Guid>("CourierId")
                        .HasColumnType("uuid")
                        .HasColumnName("courier_id");

                    b.Property<DateTime>("DeliveryDate")
                        .ValueGeneratedOnAddOrUpdate()
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("delivery_date");

                    b.Property<Guid>("OrderId")
                        .HasColumnType("uuid")
                        .HasColumnName("order_id");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("status");

                    b.HasKey("Id");

                    b.HasIndex("CourierId");

                    b.HasIndex("OrderId");

                    b.ToTable("delivery_operations");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.Employee", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<string>("ContactInfo")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("contact_info");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("name");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("password_hash");

                    b.Property<string>("Position")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("position");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("role");

                    b.Property<string>("Salt")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("salt");

                    b.HasKey("Id");

                    b.ToTable("employees");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.MenuItem", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<Guid>("PizzaId")
                        .HasColumnType("uuid")
                        .HasColumnName("pizza_id");

                    b.Property<decimal>("Price")
                        .HasColumnType("numeric")
                        .HasColumnName("price");

                    b.Property<decimal>("TotalPrice")
                        .HasColumnType("numeric")
                        .HasColumnName("total_price");

                    b.HasKey("Id");

                    b.HasIndex("PizzaId");

                    b.ToTable("menu");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.Order", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<Guid>("CustomerId")
                        .HasColumnType("uuid")
                        .HasColumnName("customer_id");

                    b.Property<string>("DeliveryAddress")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("delivery_address");

                    b.Property<Guid>("EmployeeId")
                        .HasColumnType("uuid")
                        .HasColumnName("employee_id");

                    b.Property<DateTime?>("OrderDate")
                        .ValueGeneratedOnAddOrUpdate()
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("order_date");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("status");

                    b.HasKey("Id");

                    b.HasIndex("CustomerId");

                    b.HasIndex("EmployeeId");

                    b.ToTable("orders");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.OrderedPizza", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<Guid>("OrderId")
                        .HasColumnType("uuid")
                        .HasColumnName("order_id");

                    b.Property<Guid>("PizzaId")
                        .HasColumnType("uuid")
                        .HasColumnName("pizza_id");

                    b.Property<int>("Quantity")
                        .HasColumnType("integer")
                        .HasColumnName("quantity");

                    b.HasKey("Id");

                    b.HasIndex("OrderId");

                    b.HasIndex("PizzaId");

                    b.ToTable("ordered_pizzas");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.Pizza", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<decimal>("CostPrice")
                        .HasColumnType("numeric")
                        .HasColumnName("cost_price");

                    b.Property<string>("Image")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("image");

                    b.Property<string>("Ingredients")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("ingredients");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("name");

                    b.HasKey("Id");

                    b.ToTable("pizzas");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.Promotion", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<string>("Conditions")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("conditions");

                    b.Property<decimal>("DiscountAmount")
                        .HasColumnType("numeric")
                        .HasColumnName("discount_amount");

                    b.Property<DateTime>("EndDate")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("end_date");

                    b.Property<Guid>("PizzaId")
                        .HasColumnType("uuid")
                        .HasColumnName("pizza_id");

                    b.Property<string>("PromotionName")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("promotion_name");

                    b.Property<DateTime>("StartDate")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("start_date");

                    b.HasKey("Id");

                    b.HasIndex("PizzaId");

                    b.ToTable("promotions");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.Review", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<Guid>("CustomerId")
                        .HasColumnType("uuid")
                        .HasColumnName("customer_id");

                    b.Property<Guid>("OrderId")
                        .HasColumnType("uuid")
                        .HasColumnName("order_id");

                    b.Property<int>("Rating")
                        .HasColumnType("integer")
                        .HasColumnName("rating");

                    b.Property<DateTime?>("ReviewDate")
                        .ValueGeneratedOnAddOrUpdate()
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("review_date");

                    b.Property<string>("ReviewText")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("review_text");

                    b.HasKey("Id");

                    b.HasIndex("CustomerId");

                    b.HasIndex("OrderId");

                    b.ToTable("reviews");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.SalesStatistic", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<decimal>("CostPrice")
                        .HasColumnType("numeric")
                        .HasColumnName("cost_price");

                    b.Property<decimal>("OrderAmount")
                        .HasColumnType("numeric")
                        .HasColumnName("order_amount");

                    b.Property<Guid>("OrderId")
                        .HasColumnType("uuid")
                        .HasColumnName("order_id");

                    b.Property<decimal>("Profit")
                        .HasColumnType("numeric")
                        .HasColumnName("profit");

                    b.Property<DateTime?>("SaleDate")
                        .ValueGeneratedOnAddOrUpdate()
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("sale_date");

                    b.HasKey("Id");

                    b.HasIndex("OrderId")
                        .IsUnique();

                    b.ToTable("sales_statistics");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.DeliveryOperation", b =>
                {
                    b.HasOne("PizzaWebApp.Models.Entities.Courier", "Courier")
                        .WithMany("DeliveryOperations")
                        .HasForeignKey("CourierId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("PizzaWebApp.Models.Entities.Order", "Order")
                        .WithMany("DeliveryOperations")
                        .HasForeignKey("OrderId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Courier");

                    b.Navigation("Order");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.MenuItem", b =>
                {
                    b.HasOne("PizzaWebApp.Models.Entities.Pizza", "Pizza")
                        .WithMany("MenuItems")
                        .HasForeignKey("PizzaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Pizza");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.Order", b =>
                {
                    b.HasOne("PizzaWebApp.Models.Entities.Customer", "Customer")
                        .WithMany("Orders")
                        .HasForeignKey("CustomerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("PizzaWebApp.Models.Entities.Employee", "Employee")
                        .WithMany("Orders")
                        .HasForeignKey("EmployeeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Customer");

                    b.Navigation("Employee");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.OrderedPizza", b =>
                {
                    b.HasOne("PizzaWebApp.Models.Entities.Order", "Order")
                        .WithMany("OrderedPizzas")
                        .HasForeignKey("OrderId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("PizzaWebApp.Models.Entities.Pizza", "Pizza")
                        .WithMany("OrderedPizzas")
                        .HasForeignKey("PizzaId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Order");

                    b.Navigation("Pizza");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.Promotion", b =>
                {
                    b.HasOne("PizzaWebApp.Models.Entities.Pizza", "Pizza")
                        .WithMany("Promotions")
                        .HasForeignKey("PizzaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Pizza");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.Review", b =>
                {
                    b.HasOne("PizzaWebApp.Models.Entities.Customer", "Customer")
                        .WithMany("Reviews")
                        .HasForeignKey("CustomerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("PizzaWebApp.Models.Entities.Order", "Order")
                        .WithMany("Reviews")
                        .HasForeignKey("OrderId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Customer");

                    b.Navigation("Order");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.SalesStatistic", b =>
                {
                    b.HasOne("PizzaWebApp.Models.Entities.Order", "Order")
                        .WithOne("SalesStatistic")
                        .HasForeignKey("PizzaWebApp.Models.Entities.SalesStatistic", "OrderId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Order");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.Courier", b =>
                {
                    b.Navigation("DeliveryOperations");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.Customer", b =>
                {
                    b.Navigation("Orders");

                    b.Navigation("Reviews");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.Employee", b =>
                {
                    b.Navigation("Orders");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.Order", b =>
                {
                    b.Navigation("DeliveryOperations");

                    b.Navigation("OrderedPizzas");

                    b.Navigation("Reviews");

                    b.Navigation("SalesStatistic");
                });

            modelBuilder.Entity("PizzaWebApp.Models.Entities.Pizza", b =>
                {
                    b.Navigation("MenuItems");

                    b.Navigation("OrderedPizzas");

                    b.Navigation("Promotions");
                });
#pragma warning restore 612, 618
        }
    }
}
