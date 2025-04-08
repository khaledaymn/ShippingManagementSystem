using System.ComponentModel.DataAnnotations;

namespace Shipping_Project.DTOs.ResetPasswordDtos
{
    public class ResetPasswordRequest
    {
        [Required(ErrorMessage ="This mail is unvalid")]
        public string Token { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [DataType(DataType.Password)]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 8)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$",
        ErrorMessage = "Password must contain at least one uppercase, one lowercase, one number and one special character")]
        public string NewPassword { get; set; }
        [Required(ErrorMessage = "Confirm password is required")]
        [DataType(DataType.Password)]
        [Compare("NewPassword", ErrorMessage = "The password and confirmation password do not match.")]
        public string ConfirmNewPassword { get; set; }
        [Required(ErrorMessage = "Mail is required")]
        [EmailAddress(ErrorMessage = "Mail is not valid ")]
        public string Email { get; set; }
    }
}
