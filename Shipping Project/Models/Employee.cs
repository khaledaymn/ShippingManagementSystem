using Shipping_Project.Extend;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shipping_Project.Models
{
    public class Employee
    {
        [ForeignKey("User"),Key]
        public string UserID { get; set; }
        public virtual ApplicationUser User { get; set; }
    }
}
