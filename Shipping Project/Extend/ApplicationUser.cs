using Microsoft.AspNetCore.Identity;
using Shipping_Project.DTOs.MerchantDtos;
using Shipping_Project.Models;

namespace Shipping_Project.Extend
{
    public class ApplicationUser :IdentityUser
    {
        public ApplicationUser()
        {
            
        }

        public ApplicationUser(MerchantDtoForAdding Merchant)
        {
            HiringDate = Merchant.StartWorkDDate;
            PhoneNumber = Merchant.PhoneNumber;
            Email = Merchant.Email;
            UserName = Merchant.UserName;
            PasswordHash = Merchant.Password;
            Name = Merchant.Name;
            Address = Merchant.Address;
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
