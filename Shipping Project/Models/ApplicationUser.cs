using Microsoft.AspNetCore.Identity;
using Shipping_Project.DTOs;

namespace Shipping_Project.Models
{
    public class ApplicationUser :IdentityUser
    {
        public ApplicationUser()
        {
            
        }
        public ApplicationUser(MerchantDtoForAdding Merchant)
        {
            this.HiringDate=Merchant.StartWorkDDate;
            this.PhoneNumber=Merchant.PhoneNumber;
            this.Email=Merchant.Email;
            this.UserName   =Merchant.UserName;
            this.PasswordHash = Merchant.Password;
          
            this.Address= Merchant.Address;
        }
        public string Name { get; set; }
        public string? Address { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime? HiringDate { get; set; }
        public virtual  Merchant? Merchant { get; set; }
        public virtual  Employee? Employee { get; set; }
        public virtual ShippigRepresentative? Representive { get; set; }
        public virtual List<UserBranches>? UserBranches { get; } = new List<UserBranches>();

    }
}
