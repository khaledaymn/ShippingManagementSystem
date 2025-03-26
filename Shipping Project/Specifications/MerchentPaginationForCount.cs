using CoreLayer.Specifications;
using Shipping_Project.Models;
using Shipping_Project.Specifications.Params;

namespace Shipping_Project.Specifications
{
    public class MerchantPaginationForCount:BaseSpecifiction<Merchant>
    {
        public MerchantPaginationForCount(MerchantParams Params):
            base(m => (!Params.ActiveStatus.HasValue || m.User.IsDeleted != Params.ActiveStatus) &&
            (string.IsNullOrEmpty(Params.SearchByName) || m.User.UserName.ToLower().Contains(Params.SearchByName)))
        {
        }
    }
   
}
