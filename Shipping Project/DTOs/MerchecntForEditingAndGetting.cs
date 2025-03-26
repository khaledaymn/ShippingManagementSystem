using Shipping_Project.Models;
using System.ComponentModel.DataAnnotations;

namespace Shipping_Project.DTOs
{
    public class MerchecntForEditingAndGetting
    {
        
        [Required]
        public string Id { get; set; }
        [Required]
        public string Address { get; set; }
        [Required]
        public string Name { get; set; }
        public DateTime? StartWorkDDate { get; set; }
        [Required]
        public string UserName { get; set; }

        [Required,EmailAddress]
        public string Email { get; set; }
        [Required]
        [Phone]
        public string PhoneNumber { get; set; }
        [Required]
       
        public string StoreName { get; set; }
        [Required]
        public float RejectedOrderPrecentage { get; set; }
        public int? SpecialPickUp { get; set; }
        public List<int>? BranchesIds { get; set; } = new();

        public List<SpecialDeliveryPriceForMerchant>? SpecialDeliveryPrices { get; set; } = new();

    }
}
