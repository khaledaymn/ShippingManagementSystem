
using CoreLayer.Specifications;
using Microsoft.EntityFrameworkCore;
using Shipping_Project.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RepoLayer
{
   internal static class QueryEvaluator<T> where T :BaseModel
    {
        public static IQueryable<T> MakeQuery(IQueryable<T> Sequence, IspecificationContract<T> Spec)
        {
            var query = Sequence;
            if (Spec.Criteria != null)
                query = query.Where(Spec.Criteria);
            if(Spec.OrderBy != null)
                query = query.OrderBy(Spec.OrderBy);
            if (Spec.OrderByDesc != null)
                query = query.OrderByDescending(Spec.OrderByDesc);
            if (Spec.IsPaginated)
               query = query.Skip(Spec.skip).Take(Spec.take);
            query = Spec.Includes.Aggregate(query, (CurrentQuery, InputInclude) => CurrentQuery.Include(InputInclude));
            return query;
        }
    }
}
