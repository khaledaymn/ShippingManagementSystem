using System.ComponentModel.DataAnnotations;

namespace Shipping_Project.DTOs
{
    public class AddEmployeeDTO
    {
        public string Name { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters long.")]
        public string Password { get; set; } 
        public string PhoneNumber { get; set; }
        public List<int> BranchIds { get; set; }
        public string Permission { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
