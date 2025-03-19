using Microsoft.AspNetCore.Identity;

namespace Shipping_Project.Models
{
    public class ApplicationUser :IdentityUser
    {
        public string? Address { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime? HiringDate { get; set; }
        public virtual  Merchent? Merchent { get; set; }
        public virtual  Employee? Employee { get; set; }
        public virtual ShippigRepresentive? Representive { get; set; }
        public virtual List<UserBranches>? UserBranches { get; } = new List<UserBranches>();

    }
}
