using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shipping_Project.Models
{
    [PrimaryKey(nameof(OrderId), nameof(RejectedReasonId))]
    public class RejectedReasonOrder
    {
        [ForeignKey(nameof(Order))]
        public int OrderId { get; set; }
        public virtual Order Order { get; set; }  
        [ForeignKey(nameof(RejectedReason))]
        public int RejectedReasonId { get; set; }
        public virtual RejectedReason RejectedReason { get; set; }
    }
}
