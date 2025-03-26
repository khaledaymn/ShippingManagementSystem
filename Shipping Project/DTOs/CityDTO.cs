using Shipping_Project.Models;

namespace Shipping_Project.DTOs
{
    public class CityDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public double ChargePrice { get; set; }
        public double PickUpPrice { get; set; }
        public int GovernorateId { get; set; }
        public string GovernorateName { get; set; }
        public bool IsDeleted { get; set; }

        // دالة لتحويل City إلى CityDTO
        public static CityDTO FromCity(City city)
        {
            return new CityDTO
            {
                Id = city.ID,
                Name = city.Name,
                ChargePrice = city.ChargePrice,
                PickUpPrice = city.PickUpPrice,
                GovernorateId = city.GovernorateId,
                GovernorateName = city.Governorate?.Name, // لو Governorate مش null
                IsDeleted = city.IsDeleted
            };
        }

        // دالة لتحويل قائمة من City إلى قائمة من CityDTO
        public static List<CityDTO> FromCities(List<City> cities)
        {
            return cities.Select(city => FromCity(city)).ToList();
        }
    }
}