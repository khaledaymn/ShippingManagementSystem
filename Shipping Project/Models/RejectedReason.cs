namespace Shipping_Project.Models
{
    public class RejectedReason :BaseModel
    {
        public string Text { get; set; }
        public bool IsDeleted { get; set; }
        public virtual List<RejectedReasonOrder>? Orders { get; }=new List<RejectedReasonOrder>();
    }
}
