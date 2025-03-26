using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shipping_Project.Models
{
    [PrimaryKey(nameof(ShippingRepId),nameof(GovernorateId))]
    public class ShippingRepGovernorate
    {
        [ForeignKey("ShippigRepresentative")]
        public string ShippingRepId { get; set; }
        [ForeignKey("Governorate")]
        public int GovernorateId { get; set; }
        public virtual ShippigRepresentative? ShippigRepresentative { get; set; }
        public virtual Governorate? Governorate { get; set; }
    }
}
