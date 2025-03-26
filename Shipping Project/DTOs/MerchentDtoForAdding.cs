
using Shipping_Project.Models;
using System.ComponentModel.DataAnnotations;

namespace Shipping_Project.DTOs
{
    public class MerchantDtoForAdding
    {
       
       

        [Required]
        public string Address { get; set; }

        [Required]
        public string Name { get; set; }
        public DateTime? StartWorkDDate { get; set; }
        [Required]
        public string UserName { get; set; }

        [Required]
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }
        [Required]
        [RegularExpression(@"^\+?[1-9]\d{1,14}$", ErrorMessage = "Enter a valid international phone number.")]
        public string PhoneNumber { get; set; }
        [Required]
        [DataType(DataType.Password)]
        public string? Password { get; set; }
    
        [Required]

        public string StoreName { get; set; }
        [Required]
        public float RejectedOrderPrecentage { get; set; }
        public int? SpecialPickUp { get; set; }
        public List<int>? BranchesIds { get; set; } = new();

        public List<SpecialDeliveryPriceForMerchant>? SpecialDeliveryPrices { get; set; } = new();



    }
}

