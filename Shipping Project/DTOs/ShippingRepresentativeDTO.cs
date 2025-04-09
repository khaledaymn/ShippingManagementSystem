namespace Shipping_Project.DTOs
{
    using System.ComponentModel.DataAnnotations;

    public class ShippingRepresentativeDTO
    {
        [Required(ErrorMessage = "Name is required.")]
        [MinLength(3, ErrorMessage = "Name must be at least 3 characters long.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Phone number is required.")]
        //[RegularExpression(@"^\d{10,15}$", ErrorMessage = "Phone number must be between 10 and 15 digits.")]
        public string PhoneNumber { get; set; }

        [Required(ErrorMessage = "Address is required.")]
        public string Address { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters long.")]
        public string Password { get; set; }

        [Required(ErrorMessage = "At least one branch must be selected.")]
        public List<int> BranchIds { get; set; } // Multiple Branches

        [Required(ErrorMessage = "At least one governorate must be selected.")]
        public List<int> GovernorateIds { get; set; } // Multiple Governorates

        [Required(ErrorMessage = "Discount type is required.")]
        public string DiscountType { get; set; }

        [Range(0, 100, ErrorMessage = "Company percentage must be between 0 and 100.")]
        public double CompanyPersentage { get; set; }
    }
}
