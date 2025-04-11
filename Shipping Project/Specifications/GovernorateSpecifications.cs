using CoreLayer.Specifications;
using Shipping_Project.Models;
using Shipping_Project.Specifications.Params;
using System.Linq.Expressions;

public class GovernorateSpecifications : BaseSpecifiction<Governorate>
{
    public GovernorateSpecifications(MerchantParams Params)
        : base(g =>
            (string.IsNullOrEmpty(Params.SearchByName) || g.Name.ToLower().Contains(Params.SearchByName.ToLower()))
        // Add other filtering conditions as needed
        )
    {
        Pagination(Params.PageSize * (Params.PageIndex - 1), Params.PageSize);

        // Add sorting if needed
        if (!string.IsNullOrEmpty(Params.sort))
        {
            switch (Params.sort)
            {
                case "nameAsc":
                    orderBy(g => g.Name);
                    break;
                case "nameDesc":
                    orderByDesc(g => g.Name);
                    break;
                default:
                    orderBy(g => g.ID);
                    break;
            }
        }
    }

    public GovernorateSpecifications(Expression<Func<Governorate, bool>> criteria) : base(criteria)
    {
    }
}
