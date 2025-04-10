using CoreLayer.Specifications;
using Shipping_Project.Models;
using Shipping_Project.Specifications.Params;

namespace Shipping_Project.Specifications
{
    public class BranchSpecification :BaseSpecifiction<Branches>
    {
        public BranchSpecification(BranchParams Params):base
            (p=>
            (string.IsNullOrEmpty(Params.SearchByName)||p.Name.ToLower().Contains(Params.SearchByName))
            )
        {
            Pagination(Params.PageSize*(Params.PageIndex-1) ,Params.PageSize);
        }
    }
}
