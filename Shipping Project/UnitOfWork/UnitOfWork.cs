using Microsoft.EntityFrameworkCore;
using Shipping_Project.IGenaricRepository;
using Shipping_Project.Models;
using Shipping_Project.Repository;
using System.Collections.Concurrent;

namespace Shipping_Project.UnitOfWork
{
    public class UnitOfWork :IDisposable
    {
        private readonly ShippingContext context;
        private readonly ConcurrentDictionary<string, object> Repos;
        //private readonly ConcurrentDictionary<Type, object> Repos;
        public UnitOfWork(ShippingContext _context)
        {

            context = _context;
            Repos = new();
        }


        public IGenaricRepo<T> Repository<T>() where T : BaseModel
        {
            //if (!Repos.TryGetValue(typeof(T), out var repo))
            //{
            //    repo = new GenaricRepo<T>(context);
            //    Repos[typeof(T)] = repo;
            //}
            //return (IGenaricRepo<T>)repo;
            // OR
            //return (IGenaricRepo<T>)Repos.GetOrAdd(typeof(T), _ => new GenaricRepo<T>(context));
            return (IGenaricRepo<T>)Repos.GetOrAdd(typeof(T).Name, new GenaricRepo<T>(context));
        }

        public async Task Save()
        {
            await context.SaveChangesAsync();
        }
        public void Dispose()
        {
            context.Dispose();
        }
    }
}
