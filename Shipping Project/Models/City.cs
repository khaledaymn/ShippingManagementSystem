using System.ComponentModel.DataAnnotations.Schema;

namespace Shipping_Project.Models
{
    public class City :BaseModel
    {
        public string Name { get; set; }
        public double ChargePrice { get; set; }
        public double PickUpPrice { get; set; }
        public bool IsDeleted { get; set; }=false;
        public virtual List<MerchentCity>? MerchentCities { get; } = new List<MerchentCity>();
        public virtual List<Branches>? Branches { get; }=new List<Branches>();
        [ForeignKey("Governorate")]
        public int GovernorateId { get; set; }
        public virtual Governorate? Governorate { get; set; }
    }
}
