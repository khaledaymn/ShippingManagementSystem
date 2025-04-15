using CoreLayer.Specifications;
using Shipping_Project.Models;
using Shipping_Project.Specifications.Params;

namespace Shipping_Project.Specifications
{
    public class BranchPaginationForCount :BaseSpecifiction<Branches>
    {
        public BranchPaginationForCount(BranchParams Params) : base
            (p =>
            (string.IsNullOrEmpty(Params.SearchByName) || p.Name.ToLower().Contains(Params.SearchByName))
            )
        { }

    }
}
