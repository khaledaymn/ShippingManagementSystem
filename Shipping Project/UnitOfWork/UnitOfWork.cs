using Shipping_Project.IGenaricRepository;
using Shipping_Project.Models;
using Shipping_Project.Repository;
using System.Collections.Concurrent;

namespace Shipping_Project.UnitOfWork
{
    public class UnitOfWork
    {
        private readonly ShippingContext context;
        private readonly ConcurrentDictionary<string, object> Repos;
        public UnitOfWork(ShippingContext _context)
        {

            context = _context;
            Repos = new();
        }
        public IGenaricRepo<T> Repository<T>() where T : BaseModel
        {
            return (IGenaricRepo<T>)Repos.GetOrAdd(typeof(T).Name, new GenaricRepo<T>(context));
        }
    }
}
