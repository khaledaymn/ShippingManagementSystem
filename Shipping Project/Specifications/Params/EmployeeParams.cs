namespace Shipping_Project.Specifications.Params
{
    public class EmployeeParams
    {
        public string? Sort { get; set; }
		private int pageSize = 5 ;
		public int PageSize 
        {
			get { return pageSize; }
			set { pageSize = value >10 ?10 : value; }
		}
		public int PageIndex { get; set; } = 1;
		private string? searchByName;

		public string? SearchByName
        {
			get { return searchByName; }
			set { searchByName = value.ToLower(); } 
		}
	}
}
