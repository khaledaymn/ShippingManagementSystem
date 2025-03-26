using System.ComponentModel.DataAnnotations.Schema;

namespace Shipping_Project.Models
{
    public class Branches :BaseModel
    {
        public string Name { get; set; }
        public DateTime CreationDate { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; } = false;
        public string Location { get; set; }
        public virtual List<UserBranches>? UserBranches { get; }=new List<UserBranches>();
        [ForeignKey("City")]
        public int CityId { get; set; }
        public virtual City? City { get; set; }
        public virtual List<Order>? BranchOrder { get; } =new List<Order>();

    }
}
