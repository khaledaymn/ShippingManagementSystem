
using Shipping_Project.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CoreLayer.Specifications
{
    public class BaseSpecifiction<T> : IspecificationContract<T> where T : BaseModel
    {
        public Expression<Func<T, bool>>? Criteria { get; set; }
        public List<Expression<Func<T, object>>> Includes { get; set; } = new List<Expression<Func<T, object>>>();
        public Expression<Func<T, object>>? OrderBy { get ; set ; }
        public Expression<Func<T, object>>? OrderByDesc { get ; set ; }
        public int skip { get; set; }
        public int take { get; set; }
        public bool IsPaginated { get; set; } = false;

        public BaseSpecifiction()
        {
            
        }
        public BaseSpecifiction(Expression<Func<T, bool>>? inputCriteria)
        {
            if(inputCriteria != null)
            {
                Criteria = inputCriteria;
            }
        }
        public void orderBy(Expression<Func<T, object>>? orderby)
        {
           if(orderby != null)
               OrderBy = orderby;
        }
        public void orderByDesc(Expression<Func<T, object>>? orderbydesc)
        {
            if (orderbydesc != null)
               OrderByDesc = orderbydesc;
        }
        public void Pagination(int skip, int take)
        {
            IsPaginated = true;
            this.skip = skip;
           this.take = take;
        }
    }
}
