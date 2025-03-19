using System.ComponentModel.DataAnnotations.Schema;

namespace Shipping_Project.Models
{
    public class Merchent :BaseModel
    {
        public string StoreName { get; set; }
        public double RejectedOrederPercentage { get; set; }
        [ForeignKey("User")]
        public string UserID { get; set; }
        public virtual ApplicationUser User { get; set; }
        public virtual List<MerchentCity>? MerchentCities { get; set; } = new List<MerchentCity>();
        public virtual List<Order> MerchentOrders { get; } = new List<Order>();

    }
}
