using System.ComponentModel.DataAnnotations.Schema;

namespace Shipping_Project.Models
{
    public class Product : BaseModel
    {
        public string Name { get; set; }
        public int Weight { get; set; }
        public int Quantity { get; set; }
        [ForeignKey("Order")]
        public int OrderId { get; set; }
        public virtual Order? Order { get; set; }

    }
}
