using Microsoft.EntityFrameworkCore;
using Shipping_Project.Models;
using Shipping_Project.Repository;

namespace Shipping_Project.IGenaricRepository
{
    public class CityRepository : GenaricRepo<City>, ICityRepository
    {
        private readonly ShippingContext db;

        public CityRepository(ShippingContext db) : base(db)
        {
            this.db = db;
        }

        public async Task<List<City>> GetCitiesByGovernorateId(int governorateId)
        {
            return await db.Citys
                .Where(c => c.GovernorateId == governorateId && !c.IsDeleted)
                .Include(c => c.Governorate)
                .ToListAsync();
        }
    }
}