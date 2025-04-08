namespace Shipping_Project.Models
{
    public class ChargeType : BaseModel
    {
        public string Name { get; set; }
        public double ExtraPrice { get; set; }
        public int NumOfDay { get; set; }
        public bool IsDeleted { get; set; } = false;
        public virtual List<Order>? Orders { get; } = new List<Order>();
    }
}
