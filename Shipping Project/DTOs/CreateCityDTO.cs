using Shipping_Project.Models;

namespace Shipping_Project.DTOs
{
    public class CreateCityDTO
    {
        public string Name { get; set; }
        public double ChargePrice { get; set; }
        public double PickUpPrice { get; set; }
        public int GovernorateId { get; set; }

        // دالة لتحويل CreateCityDTO إلى City
        public City ToCity()
        {
            return new City
            {
                Name = Name,
                ChargePrice = ChargePrice,
                PickUpPrice = PickUpPrice,
                GovernorateId = GovernorateId,
                IsDeleted = false // القيمة الافتراضية
            };
        }
    }
}