using CoreLayer.Specifications;
using Shipping_Project.Models;
using Shipping_Project.Specifications.Params;
using System.Linq.Expressions;

namespace Shipping_Project.Specifications
{
    public class MerchantSpecfications:BaseSpecifiction<Merchant>
    {
        public MerchantSpecfications(MerchantParams Params) :
           base (m=> (!Params.ActiveStatus.HasValue || m.User.IsDeleted != Params.ActiveStatus) && (string.IsNullOrEmpty(Params.SearchByName) || m.User.UserName.ToLower().Contains(Params.SearchByName)))
        {
           
            if (Params.sort != null)
            {
                switch (Params.sort)
                {
                    case "userName":
                        orderBy(m => m.User.UserName);
                        break;
                    case "userNameDesc":
                        orderByDesc(m => m.User.UserName);
                        break;
                    default:
                        orderBy(m => m.UserID);
                        break;
                }
            }
            Pagination(Params.PageSize * (Params.PageIndex - 1), Params.PageSize);
        }
        public MerchantSpecfications(Expression<Func<Merchant, bool>>? inputCriteria) : base(inputCriteria)
        {

           
        }
    }
}
