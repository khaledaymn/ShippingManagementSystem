using CoreLayer.Specifications;
using Shipping_Project.Models;
using Shipping_Project.Specifications.Params;
using System.Linq.Expressions;

namespace Shipping_Project.Specifications
{
    public class EmployeeSpecfication :BaseSpecifiction<Employee>
    {
        public EmployeeSpecfication(EmployeeParams param):base
            (p=>
            (string.IsNullOrEmpty(param.SearchByName)||p.User.Name.Contains(param.SearchByName)) 
            )
        {
            if(param.Sort is not null)
            {
                switch(param.Sort)
                {
                    case "ByName":
                        orderBy(p => p.User.Name);
                        break;
                }
            }
            // 100 employee 
            // 40=>50
            //page size = 10
            // page index = 5                   5-1*10
            Pagination(param.PageSize * (param.PageIndex - 1), param.PageSize);
        }
        public EmployeeSpecfication(Expression<Func<Employee, bool>>? inputCriteria) :base(inputCriteria) { }
    }
}
