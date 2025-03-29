using System.ComponentModel.DataAnnotations;

namespace Shipping_Project.DTOs.ProductDtos
{
    public class AddedProductDto
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public double Weight { get; set; }
        public int Quantity { get; set; }
    }
}
