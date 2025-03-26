using Shipping_Project.Models;

namespace Shipping_Project.DTOs
{
    public class UpdateCityDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public double ChargePrice { get; set; }
        public double PickUpPrice { get; set; }
        public int GovernorateId { get; set; }

        // دالة لتحديث بيانات City بناءً على UpdateCityDTO
        public void UpdateCity(City city)
        {
            city.ID = Id;
            city.Name = Name;
            city.ChargePrice = ChargePrice;
            city.PickUpPrice = PickUpPrice;
            city.GovernorateId = GovernorateId;
        }
    }
}