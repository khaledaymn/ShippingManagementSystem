using Shipping_Project.Specifications.Params;
using CoreLayer.Specifications;
using Shipping_Project.Models;
namespace Shipping_Project.Specifications
{
    public class GovernoratePaginationForCount : BaseSpecifiction<Governorate>
    {
        public GovernoratePaginationForCount(MerchantParams Params): 
            base(g => (string.IsNullOrEmpty(Params.SearchByName) ||
            g.Name.ToLower().Contains(Params.SearchByName.ToLower())))
           
        {
        }
    }
}
