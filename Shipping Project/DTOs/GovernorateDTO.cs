using Shipping_Project.Models;
using System.ComponentModel.DataAnnotations;

namespace Shipping_Project.DTOs
{
    public class GovernorateDTO
    {
        private Governorate g;

        public GovernorateDTO(Governorate g)
        {
            this.g = g;
        }

        public int Id { get; set; }
        [Required(ErrorMessage = "Name Is Required")]
        [StringLength(100 ,MinimumLength = 3, ErrorMessage = "Name must be between 3 and 100 characters")]
        public string Name { get; set; }
        public bool IsDeleted { get; set; } = false;
           
    }
}
