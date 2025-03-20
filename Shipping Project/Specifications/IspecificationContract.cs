using Shipping_Project.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CoreLayer.Specifications
{
  public  interface IspecificationContract<T> where T :BaseModel
    {
        public Expression<Func<T,bool>>? Criteria { get; set; }
        public List<Expression<Func<T, Object>>> Includes { get; set; }
        public Expression<Func<T,object>>? OrderBy { get; set; }
        public Expression<Func<T, object>>? OrderByDesc { get; set; }
        public bool IsPaginated { get; set; } 
        public int skip { get; set; }
        public int take { get; set; }

    }
}
