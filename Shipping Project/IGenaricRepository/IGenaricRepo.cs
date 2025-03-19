namespace Shipping_Project.IGenaricRepository
{
    public interface IGenaricRepo<T> where T : class
    {
        public Task<List<T>> GetAll();
        public Task<T> GetById(int id);
        public Task ADD(T obj);
        public void Delete(int id);
        public void Update(T obj);
    }
}
