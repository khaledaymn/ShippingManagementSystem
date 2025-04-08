using System.ComponentModel.DataAnnotations;

namespace APIsLayer.DTOs.Identity
{
    public class UserDtocs
    {
        [EmailAddress]
        [Required]
        public string Email { get; set; }
        [Required]
        public string DiaplyName { get; set; }
        [Required]
        public string Token { get; set; }
    }
}
