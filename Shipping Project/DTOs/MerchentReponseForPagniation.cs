namespace Shipping_Project.DTOs
{
    public class MerchantReponseForPagniation<T> 
    {
        public MerchantReponseForPagniation(int pagesize, int pageindex, int count, IReadOnlyList<T> data)
        {
            this.PageSize = pagesize;
            this.PageIndex = pageindex;
            this.Count = count;
            this.Data = data;
        }
        public int PageSize { get; set; }
        public int PageIndex { get; set; }
        public int Count { get; set; }
        public IReadOnlyList<T> Data { get; set; }
    }
}
