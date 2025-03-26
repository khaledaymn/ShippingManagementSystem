using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shipping_Project.Models
{
    [PrimaryKey(nameof(PermissionId),nameof(GroupId))]
    public class PermissionGroup
    {
        public Operation Operation { get; set; }
        [ForeignKey("Permission")]
        public int PermissionId { get; set; }
        [ForeignKey("Group")]
        public int GroupId { get; set; }
        public virtual Permission? Permission { get; set; }
        public virtual Group? Group { get; set; }
    }
    public enum Operation
    {
        Add,
        Update,
        Delete,
        Get  
    }
}
