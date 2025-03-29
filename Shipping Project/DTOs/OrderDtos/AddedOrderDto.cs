using Shipping_Project.DTOs.ProductDtos;
using Shipping_Project.Models;
using System.ComponentModel.DataAnnotations;

namespace Shipping_Project.DTOs.OrderDtos
{
    public class AddedOrderDto
    {

        [Required]
        public string CustomerName { get; set; }
        [Required]
        [Phone]
        public string CustomerPhone1 { get; set; }
        [Phone]

        public string? CustomerPhone2 { get; set; }
        
        public string? Notes { get; set; }
        [Required]
        public OrderType OrderType { get; set; }
        [Required]
        public PaymentType PaymentType { get; set; }
        [Required]
        public double OrderPrice { get; set; }
        [Required]
        public bool ShippingToVillage { get; set; }
        public string? VillageAndStreet { get; set; }
        [Required]
    
        public int CityId { get; set; }
        [Required]
        public int ChargeTypeId { get; set; }
        [Required]
        public int BranchId { get; set; }
        [Required]
        public string MerchantId { get; set; }
        [Required]
        public double TotalWeight { get; set; }
        [Required]
        public List<AddedProductDto> Products { get; set; }
    }
}
