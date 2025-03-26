﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Shipping_Project.Models;

#nullable disable

namespace Shipping_Project.Migrations
{
    [DbContext(typeof(ShippingContext))]
    [Migration("20250325222443_initialMigration")]
    partial class initialMigration
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.3")
                .HasAnnotation("Proxies:ChangeTracking", false)
                .HasAnnotation("Proxies:CheckEquality", false)
                .HasAnnotation("Proxies:LazyLoading", true)
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRole", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("NormalizedName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedName")
                        .IsUnique()
                        .HasDatabaseName("RoleNameIndex")
                        .HasFilter("[NormalizedName] IS NOT NULL");

                    b.ToTable("AspNetRoles", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("ClaimType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("RoleId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetRoleClaims", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("ClaimType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserClaims", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.Property<string>("LoginProvider")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ProviderKey")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ProviderDisplayName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserLogins", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("RoleId")
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("UserId", "RoleId");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetUserRoles", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("LoginProvider")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Value")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("UserId", "LoginProvider", "Name");

                    b.ToTable("AspNetUserTokens", (string)null);
                });

            modelBuilder.Entity("Shipping_Project.Models.ApplicationUser", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<int>("AccessFailedCount")
                        .HasColumnType("int");

                    b.Property<string>("Address")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Email")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<bool>("EmailConfirmed")
                        .HasColumnType("bit");

                    b.Property<DateTime?>("HiringDate")
                        .HasColumnType("datetime2");

                    b.Property<bool>("IsDeleted")
                        .HasColumnType("bit");

                    b.Property<bool>("LockoutEnabled")
                        .HasColumnType("bit");

                    b.Property<DateTimeOffset?>("LockoutEnd")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("NormalizedEmail")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("NormalizedUserName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("PasswordHash")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PhoneNumber")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("PhoneNumberConfirmed")
                        .HasColumnType("bit");

                    b.Property<string>("SecurityStamp")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("TwoFactorEnabled")
                        .HasColumnType("bit");

                    b.Property<string>("UserName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedEmail")
                        .HasDatabaseName("EmailIndex");

                    b.HasIndex("NormalizedUserName")
                        .IsUnique()
                        .HasDatabaseName("UserNameIndex")
                        .HasFilter("[NormalizedUserName] IS NOT NULL");

                    b.ToTable("AspNetUsers", (string)null);
                });

            modelBuilder.Entity("Shipping_Project.Models.Branches", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ID"));

                    b.Property<int>("CityId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreationDate")
                        .HasColumnType("datetime2");

                    b.Property<bool>("IsDeleted")
                        .HasColumnType("bit");

                    b.Property<string>("Location")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("ID");

                    b.HasIndex("CityId");

                    b.ToTable("Branches");
                });

            modelBuilder.Entity("Shipping_Project.Models.ChargeType", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ID"));

                    b.Property<double>("ExtraPrice")
                        .HasColumnType("float");

                    b.Property<bool>("IsDeleted")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("NumOfDay")
                        .HasColumnType("int");

                    b.HasKey("ID");

                    b.ToTable("ChargeTypes");
                });

            modelBuilder.Entity("Shipping_Project.Models.City", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ID"));

                    b.Property<double>("ChargePrice")
                        .HasColumnType("float");

                    b.Property<int>("GovernorateId")
                        .HasColumnType("int");

                    b.Property<bool>("IsDeleted")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<double>("PickUpPrice")
                        .HasColumnType("float");

                    b.HasKey("ID");

                    b.HasIndex("GovernorateId");

                    b.ToTable("Citys");
                });

            modelBuilder.Entity("Shipping_Project.Models.Employee", b =>
                {
                    b.Property<string>("UserID")
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("UserID");

                    b.ToTable("Employees");
                });

            modelBuilder.Entity("Shipping_Project.Models.Governorate", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ID"));

                    b.Property<bool>("IsDeleted")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("ID");

                    b.ToTable("governorates");
                });

            modelBuilder.Entity("Shipping_Project.Models.Group", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ID"));

                    b.Property<DateTime>("CreationDAte")
                        .HasColumnType("datetime2");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("ID");

                    b.ToTable("Groups");
                });

            modelBuilder.Entity("Shipping_Project.Models.Merchant", b =>
                {
                    b.Property<string>("UserID")
                        .HasColumnType("nvarchar(450)");

                    b.Property<double>("RejectedOrederPercentage")
                        .HasColumnType("float");

                    b.Property<int?>("SpecialPickUp")
                        .HasColumnType("int");

                    b.Property<string>("StoreName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("UserID");

                    b.ToTable("Merchants");
                });

            modelBuilder.Entity("Shipping_Project.Models.MerchantCity", b =>
                {
                    b.Property<string>("MerchantId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<int>("CityId")
                        .HasColumnType("int");

                    b.Property<double>("SpecialPreice")
                        .HasColumnType("float");

                    b.HasKey("MerchantId", "CityId");

                    b.HasIndex("CityId");

                    b.ToTable("MerchantCities");
                });

            modelBuilder.Entity("Shipping_Project.Models.Order", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ID"));

                    b.Property<double>("AmountReceived")
                        .HasColumnType("float");

                    b.Property<int>("BranchId")
                        .HasColumnType("int");

                    b.Property<double>("ChargePrice")
                        .HasColumnType("float");

                    b.Property<int>("ChargeTypeId")
                        .HasColumnType("int");

                    b.Property<int>("CityId")
                        .HasColumnType("int");

                    b.Property<string>("CustomerName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("CustomerPhone1")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("CustomerPhone2")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("IsDeleted")
                        .HasColumnType("bit");

                    b.Property<string>("MerchantId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Notes")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<double>("OrderPrice")
                        .HasColumnType("float");

                    b.Property<int>("OrderState")
                        .HasColumnType("int");

                    b.Property<int>("OrderType")
                        .HasColumnType("int");

                    b.Property<int>("PaymentType")
                        .HasColumnType("int");

                    b.Property<string>("ShippigRepresentativeId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.Property<bool>("ShippingToVillage")
                        .HasColumnType("bit");

                    b.Property<int>("TotalWeight")
                        .HasColumnType("int");

                    b.Property<string>("VillageAndStreet")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("ID");

                    b.HasIndex("BranchId");

                    b.HasIndex("ChargeTypeId");

                    b.HasIndex("CityId");

                    b.HasIndex("MerchantId");

                    b.HasIndex("ShippigRepresentativeId");

                    b.ToTable("Orders");
                });

            modelBuilder.Entity("Shipping_Project.Models.Permission", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ID"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("ID");

                    b.ToTable("Permissions");
                });

            modelBuilder.Entity("Shipping_Project.Models.PermissionGroup", b =>
                {
                    b.Property<int>("PermissionId")
                        .HasColumnType("int");

                    b.Property<int>("GroupId")
                        .HasColumnType("int");

                    b.Property<int>("Operation")
                        .HasColumnType("int");

                    b.HasKey("PermissionId", "GroupId");

                    b.HasIndex("GroupId");

                    b.ToTable("PermissionGroups");
                });

            modelBuilder.Entity("Shipping_Project.Models.Product", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ID"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("OrderId")
                        .HasColumnType("int");

                    b.Property<int>("Quantity")
                        .HasColumnType("int");

                    b.Property<int>("Weight")
                        .HasColumnType("int");

                    b.HasKey("ID");

                    b.HasIndex("OrderId");

                    b.ToTable("Products");
                });

            modelBuilder.Entity("Shipping_Project.Models.RejectedReason", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ID"));

                    b.Property<bool>("IsDeleted")
                        .HasColumnType("bit");

                    b.Property<string>("Text")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("ID");

                    b.ToTable("RejectedReasons");
                });

            modelBuilder.Entity("Shipping_Project.Models.RejectedReasonOrder", b =>
                {
                    b.Property<int>("OrderId")
                        .HasColumnType("int");

                    b.Property<int>("RejectedReasonId")
                        .HasColumnType("int");

                    b.HasKey("OrderId", "RejectedReasonId");

                    b.HasIndex("RejectedReasonId");

                    b.ToTable("RejectedReasonOrder");
                });

            modelBuilder.Entity("Shipping_Project.Models.ShippigRepresentative", b =>
                {
                    b.Property<string>("UserID")
                        .HasColumnType("nvarchar(450)");

                    b.Property<double>("CompanyPersentage")
                        .HasColumnType("float");

                    b.Property<int>("DiscountType")
                        .HasColumnType("int");

                    b.HasKey("UserID");

                    b.ToTable("ShippigRepresentatives");
                });

            modelBuilder.Entity("Shipping_Project.Models.ShippingRepGovernorate", b =>
                {
                    b.Property<string>("ShippingRepId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<int>("GovernorateId")
                        .HasColumnType("int");

                    b.HasKey("ShippingRepId", "GovernorateId");

                    b.HasIndex("GovernorateId");

                    b.ToTable("ShippingRepGovernorate");
                });

            modelBuilder.Entity("Shipping_Project.Models.Standard", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ID"));

                    b.Property<int>("KGprice")
                        .HasColumnType("int");

                    b.Property<int>("StandardWeight")
                        .HasColumnType("int");

                    b.Property<int>("VillagePrice")
                        .HasColumnType("int");

                    b.HasKey("ID");

                    b.ToTable("Standards");
                });

            modelBuilder.Entity("Shipping_Project.Models.UserBranches", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<int>("BranchId")
                        .HasColumnType("int");

                    b.HasKey("UserId", "BranchId");

                    b.HasIndex("BranchId");

                    b.ToTable("UserBranches");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.HasOne("Shipping_Project.Models.ApplicationUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.HasOne("Shipping_Project.Models.ApplicationUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Shipping_Project.Models.ApplicationUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.HasOne("Shipping_Project.Models.ApplicationUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Shipping_Project.Models.Branches", b =>
                {
                    b.HasOne("Shipping_Project.Models.City", "City")
                        .WithMany("Branches")
                        .HasForeignKey("CityId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("City");
                });

            modelBuilder.Entity("Shipping_Project.Models.City", b =>
                {
                    b.HasOne("Shipping_Project.Models.Governorate", "Governorate")
                        .WithMany("Citys")
                        .HasForeignKey("GovernorateId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Governorate");
                });

            modelBuilder.Entity("Shipping_Project.Models.Employee", b =>
                {
                    b.HasOne("Shipping_Project.Models.ApplicationUser", "User")
                        .WithOne("Employee")
                        .HasForeignKey("Shipping_Project.Models.Employee", "UserID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Shipping_Project.Models.Merchant", b =>
                {
                    b.HasOne("Shipping_Project.Models.ApplicationUser", "User")
                        .WithOne("Merchant")
                        .HasForeignKey("Shipping_Project.Models.Merchant", "UserID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Shipping_Project.Models.MerchantCity", b =>
                {
                    b.HasOne("Shipping_Project.Models.City", "City")
                        .WithMany("MerchantCities")
                        .HasForeignKey("CityId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Shipping_Project.Models.Merchant", "Merchant")
                        .WithMany("MerchantCities")
                        .HasForeignKey("MerchantId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("City");

                    b.Navigation("Merchant");
                });

            modelBuilder.Entity("Shipping_Project.Models.Order", b =>
                {
                    b.HasOne("Shipping_Project.Models.Branches", "Branches")
                        .WithMany("BranchOrder")
                        .HasForeignKey("BranchId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Shipping_Project.Models.ChargeType", "ChargeType")
                        .WithMany("Orders")
                        .HasForeignKey("ChargeTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Shipping_Project.Models.City", "City")
                        .WithMany("Orders")
                        .HasForeignKey("CityId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Shipping_Project.Models.Merchant", "Merchant")
                        .WithMany("MerchantOrders")
                        .HasForeignKey("MerchantId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Shipping_Project.Models.ShippigRepresentative", "ShippigRepresentative")
                        .WithMany("ShippigRepresentativeOrders")
                        .HasForeignKey("ShippigRepresentativeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Branches");

                    b.Navigation("ChargeType");

                    b.Navigation("City");

                    b.Navigation("Merchant");

                    b.Navigation("ShippigRepresentative");
                });

            modelBuilder.Entity("Shipping_Project.Models.PermissionGroup", b =>
                {
                    b.HasOne("Shipping_Project.Models.Group", "Group")
                        .WithMany("PermissionGroup")
                        .HasForeignKey("GroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Shipping_Project.Models.Permission", "Permission")
                        .WithMany("PermissionGroup")
                        .HasForeignKey("PermissionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Group");

                    b.Navigation("Permission");
                });

            modelBuilder.Entity("Shipping_Project.Models.Product", b =>
                {
                    b.HasOne("Shipping_Project.Models.Order", "Order")
                        .WithMany("Products")
                        .HasForeignKey("OrderId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Order");
                });

            modelBuilder.Entity("Shipping_Project.Models.RejectedReasonOrder", b =>
                {
                    b.HasOne("Shipping_Project.Models.Order", "Order")
                        .WithMany("RejectedReasons")
                        .HasForeignKey("OrderId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Shipping_Project.Models.RejectedReason", "RejectedReason")
                        .WithMany("Orders")
                        .HasForeignKey("RejectedReasonId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Order");

                    b.Navigation("RejectedReason");
                });

            modelBuilder.Entity("Shipping_Project.Models.ShippigRepresentative", b =>
                {
                    b.HasOne("Shipping_Project.Models.ApplicationUser", "User")
                        .WithOne("Representive")
                        .HasForeignKey("Shipping_Project.Models.ShippigRepresentative", "UserID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Shipping_Project.Models.ShippingRepGovernorate", b =>
                {
                    b.HasOne("Shipping_Project.Models.Governorate", "Governorate")
                        .WithMany("ShippingRepGovernorates")
                        .HasForeignKey("GovernorateId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Shipping_Project.Models.ShippigRepresentative", "ShippigRepresentative")
                        .WithMany("ShippingRepGovernorates")
                        .HasForeignKey("ShippingRepId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Governorate");

                    b.Navigation("ShippigRepresentative");
                });

            modelBuilder.Entity("Shipping_Project.Models.UserBranches", b =>
                {
                    b.HasOne("Shipping_Project.Models.Branches", "Branches")
                        .WithMany("UserBranches")
                        .HasForeignKey("BranchId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Shipping_Project.Models.ApplicationUser", "User")
                        .WithMany("UserBranches")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Branches");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Shipping_Project.Models.ApplicationUser", b =>
                {
                    b.Navigation("Employee");

                    b.Navigation("Merchant");

                    b.Navigation("Representive");

                    b.Navigation("UserBranches");
                });

            modelBuilder.Entity("Shipping_Project.Models.Branches", b =>
                {
                    b.Navigation("BranchOrder");

                    b.Navigation("UserBranches");
                });

            modelBuilder.Entity("Shipping_Project.Models.ChargeType", b =>
                {
                    b.Navigation("Orders");
                });

            modelBuilder.Entity("Shipping_Project.Models.City", b =>
                {
                    b.Navigation("Branches");

                    b.Navigation("MerchantCities");

                    b.Navigation("Orders");
                });

            modelBuilder.Entity("Shipping_Project.Models.Governorate", b =>
                {
                    b.Navigation("Citys");

                    b.Navigation("ShippingRepGovernorates");
                });

            modelBuilder.Entity("Shipping_Project.Models.Group", b =>
                {
                    b.Navigation("PermissionGroup");
                });

            modelBuilder.Entity("Shipping_Project.Models.Merchant", b =>
                {
                    b.Navigation("MerchantCities");

                    b.Navigation("MerchantOrders");
                });

            modelBuilder.Entity("Shipping_Project.Models.Order", b =>
                {
                    b.Navigation("Products");

                    b.Navigation("RejectedReasons");
                });

            modelBuilder.Entity("Shipping_Project.Models.Permission", b =>
                {
                    b.Navigation("PermissionGroup");
                });

            modelBuilder.Entity("Shipping_Project.Models.RejectedReason", b =>
                {
                    b.Navigation("Orders");
                });

            modelBuilder.Entity("Shipping_Project.Models.ShippigRepresentative", b =>
                {
                    b.Navigation("ShippigRepresentativeOrders");

                    b.Navigation("ShippingRepGovernorates");
                });
#pragma warning restore 612, 618
        }
    }
}
