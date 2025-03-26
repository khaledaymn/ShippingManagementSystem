
﻿using Shipping_Project.DTOs;
using CoreLayer.Specifications;


namespace Shipping_Project.IGenaricRepository
{
    public interface IGenaricRepo<T> where T : class
    {
        public Task<List<T>> GetAll();
        public Task<T> GetById(int id);
        public Task ADD(T obj);
        public void Delete(int id);
        public void Update(T obj);
        public void Save();
        public Task<T?> GetAsyncBySpec(IspecificationContract<T> spec);
        public Task<IReadOnlyList<T>> GetAllAsyncBySpec(IspecificationContract<T> spec);
        public Task<int> GetCountAsync(IspecificationContract<T> spec);
        public Task AddRange(IEnumerable<T> objs);
        public Task DeleteRange(IEnumerable<T> objs);
    }
}
