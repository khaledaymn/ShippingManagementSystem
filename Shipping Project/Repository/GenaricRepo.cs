using Microsoft.EntityFrameworkCore;
using Shipping_Project.IGenaricRepository;
using Shipping_Project.Models;

namespace Shipping_Project.Repository
{
    public class GenaricRepo<T> : IGenaricRepo<T> where T : class
    {
        private readonly ShippingContext db;

        public GenaricRepo(ShippingContext db)
        {
            this.db = db;
        }
        public async Task ADD(T obj)
        {
             await db.Set<T>().AddAsync(obj);
        }

        public async void Delete(int id)
        {
            T obj = await GetById(id);
            db.Set<T>().Remove(obj);
        }

        public Task<List<T>> GetAll()
        {
            return db.Set<T>().ToListAsync();
        }

        public async Task<T> GetById(int id)
        {
            return await db.Set<T>().FindAsync(id);
        }

        public void Update(T obj)
        {
            db.Entry(obj).State = EntityState.Modified;
        }
    }
}
