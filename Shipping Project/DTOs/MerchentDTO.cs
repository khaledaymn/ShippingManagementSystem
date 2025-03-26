using Shipping_Project.Models;
using System.ComponentModel.DataAnnotations;

namespace Shipping_Project.DTOs
{
    public class MerchantDTO
    {
        public MerchantDTO()
        {
            
        }
        public MerchantDTO(Merchant Merchant)
        {
            this.Id = Merchant.UserID;
            this.Address = Merchant.User.Address;
            this.Email = Merchant.User.Email;
            this.PhoneNumber = Merchant.User.PhoneNumber;
            this.StartWorkDDate = Merchant.User.HiringDate;
            this.UserName = Merchant.User.UserName;
            this.StoreName = Merchant.StoreName;
            this.RejectedOrderPrecentage =(float)Merchant.RejectedOrederPercentage;
            this.IsDeleted = Merchant.User.IsDeleted;
            this.Name = Merchant.User.Name;

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
