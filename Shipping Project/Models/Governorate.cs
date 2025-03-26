namespace Shipping_Project.Models
{
    public class Governorate :BaseModel
    {
        public string Name { get; set; }
        public bool IsDeleted { get; set; } = false;
        public virtual List<ShippingRepGovernorate>? ShippingRepGovernorates { get; } = new List<ShippingRepGovernorate>();
        public virtual List<City> Citys { get; } = new List<City>();   

    }
}
