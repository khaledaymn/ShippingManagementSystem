using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
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

        private ICityRepository _cityRepository;

        public UnitOfWork(ShippingContext _context)
        {
            context = _context;
            Repos = new();
        }

        public ICityRepository CityRepository
        {
            get
            {
                return _cityRepository ??= new CityRepository(context);
            }
        }

        public IGenaricRepo<T> Repository<T>() where T : class
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

        public async Task<int> Save()
        {
          return  await context.SaveChangesAsync();
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await context.Database.BeginTransactionAsync();
        }

        public void Dispose()
        {
            context.Dispose();
        }
    }
}
