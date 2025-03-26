using CoreLayer.Specifications;
using Microsoft.EntityFrameworkCore;
using RepoLayer;
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

        public void Save()
        {
           db.SaveChanges();
        }

        public void Update(T obj)
        {
            db.Entry(obj).State = EntityState.Modified;
        }
        public async Task AddRange(IEnumerable<T> objs)
        {
            await db.Set<T>().AddRangeAsync(objs);
        }

        public async Task DeleteRange(IEnumerable<T> objs)
        {
            db.Set<T>().RemoveRange(objs);
           
        }

        #region specification
        public async Task<T?> GetAsyncBySpec(IspecificationContract<T> spec)
        {
            return await ApplySpecifications(spec).FirstOrDefaultAsync();
        }

        public async Task<IReadOnlyList<T>> GetAllAsyncBySpec(IspecificationContract<T> spec)
        {
            return await ApplySpecifications(spec).ToListAsync();
        }
        public async Task<int> GetCountAsync(IspecificationContract<T> spec)
        {
            return await ApplySpecifications(spec).CountAsync();

        }
        private IQueryable<T> ApplySpecifications(IspecificationContract<T> spec)
        {
            return QueryEvaluator<T>.MakeQuery(db.Set<T>(), spec);
        }
        #endregion
    }
}
