namespace Shipping_Project.Models
{
    public class Permission :BaseModel
    {
        public string Name { get; set; }
        public virtual List<PermissionGroup>? PermissionGroup { get; set; }
    }
}
