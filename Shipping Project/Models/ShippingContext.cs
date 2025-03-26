using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Shipping_Project.Models
{
    public class ShippingContext :IdentityDbContext<ApplicationUser>
    {
        public ShippingContext(DbContextOptions<ShippingContext> options):base(options) { }

        public DbSet<Branches> Branches { get; set; }
        public DbSet<ChargeType> ChargeTypes { get; set; }
        public DbSet<City> Citys { get; set; }  
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Governorate> governorates { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<Merchant > Merchants { get; set; }
        public DbSet<MerchantCity> MerchantCities { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<PermissionGroup> PermissionGroups { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<RejectedReason> RejectedReasons { get; set; }
        public DbSet<ShippigRepresentative> ShippigRepresentatives { get; set; }
        public DbSet<ShippingRepGovernorate> ShippingRepGovernorate {  get; set; }
        public DbSet<Standard> Standards { get; set; }
        public DbSet<UserBranches> UserBranches { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }
}
