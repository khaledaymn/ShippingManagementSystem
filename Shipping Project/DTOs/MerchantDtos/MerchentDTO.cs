using Shipping_Project.Models;
using System.ComponentModel.DataAnnotations;

namespace Shipping_Project.DTOs.MerchantDtos
{
    public class MerchantDTO
    {
        public MerchantDTO()
        {
            
        }
        public MerchantDTO(Merchant Merchant)
        {
            Id = Merchant.UserID;
            Address = Merchant.User.Address;
            Email = Merchant.User.Email;
            PhoneNumber = Merchant.User.PhoneNumber;
            StartWorkDDate = Merchant.User.HiringDate;
            UserName = Merchant.User.UserName;
            StoreName = Merchant.StoreName;
            RejectedOrderPrecentage =(float)Merchant.RejectedOrederPercentage;
            IsDeleted = Merchant.User.IsDeleted;
            Name = Merchant.User.Name;

        }
        public string Name { get; set; }
        public string Id { get; set; }
        public string Address { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? StartWorkDDate { get; set; }
        public string UserName { get; set; }
       
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string StoreName { get; set; }
        public float RejectedOrderPrecentage { get; set; }
       

    }
}
