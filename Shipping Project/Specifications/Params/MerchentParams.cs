namespace Shipping_Project.Specifications.Params
{
    public class MerchantParams
    {
        public string? sort { get; set; }
        public bool? ActiveStatus { get; set; } 
       
        private int _pagesize = 10;
        private string? searchbyname;

        public string? SearchByName
        {
            get { return searchbyname?.ToLower(); }
            set { searchbyname = value; }
        }

        public int PageSize
        {
            get { return _pagesize; }
            set { _pagesize = (value == 0 || value > 10) ? 10 : value; }
        }
        public int PageIndex { get; set; } = 1;
    }
}
