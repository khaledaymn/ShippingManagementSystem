using System.ComponentModel.DataAnnotations;

namespace Shipping_Project.DTOs.ResetPasswordDtos
{
   
        public class ForgotPasswordRequest
        {
            [Required(ErrorMessage ="Mail is required")]
            [EmailAddress(ErrorMessage ="Mail is not valid ")]
            public string Email { get; set; }
        }
    
}
