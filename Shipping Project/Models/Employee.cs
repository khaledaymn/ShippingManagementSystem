using System.ComponentModel.DataAnnotations.Schema;

namespace Shipping_Project.Models
{
    public class Employee :BaseModel
    {
        [ForeignKey("User")]
        public string UserID { get; set; }
        public virtual ApplicationUser User { get; set; }
    }
}
