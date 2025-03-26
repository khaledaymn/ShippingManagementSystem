using Shipping_Project.Models;

namespace Shipping_Project.IGenaricRepository
{
    public interface ICityRepository : IGenaricRepo<City>
    {
        Task<List<City>> GetCitiesByGovernorateId(int governorateId);
    }
}