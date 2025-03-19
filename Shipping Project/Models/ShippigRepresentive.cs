using System.ComponentModel.DataAnnotations.Schema;

namespace Shipping_Project.Models
{
    public class ShippigRepresentive :BaseModel
    {
        public double DiscountType { get; set; }
        public double CompanyPersentage { get; set; }
        [ForeignKey("User")]
        public string UserID { get; set; }
        public virtual ApplicationUser User { get; set; }
        public virtual List<ShippingRepGovernorate>? ShippingRepGovernorates { get; set; }= new List<ShippingRepGovernorate>();
        public virtual List<Order>? ShippigRepresentiveOrders { get; } = new List<Order>();

    }
}
