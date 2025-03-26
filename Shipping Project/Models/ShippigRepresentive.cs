using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shipping_Project.Models
{
    public class ShippigRepresentative
    {
        public DiscountType DiscountType { get; set; }
        public double CompanyPersentage { get; set; }
        [ForeignKey("User"),Key]
        public string UserID { get; set; }
        public virtual ApplicationUser User { get; set; }
        public virtual List<ShippingRepGovernorate>? ShippingRepGovernorates { get; set; }= new List<ShippingRepGovernorate>();
        public virtual List<Order>? ShippigRepresentativeOrders { get; } = new List<Order>();

    }
    public enum DiscountType
    {
        Fixed,
        Persentage
    }
}
