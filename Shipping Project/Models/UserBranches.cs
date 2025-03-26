using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shipping_Project.Models
{
    [PrimaryKey(nameof(UserId),nameof(BranchId))]
    public class UserBranches
    {
        public UserBranches()
        {
            
        }
        public UserBranches(string userid, int branchid )
        {
            this.UserId = userid;
            this.BranchId = branchid;
        }
        [ForeignKey("User")]
        public string UserId { get; set; }
        [ForeignKey("Branches")]
        public int BranchId { get; set; }
        public virtual ApplicationUser? User { get; set; }
        public virtual Branches? Branches { get; set; }
    }
}
