namespace Shipping_Project.Models
{
    public class Group :BaseModel
    {
        public string Name { get; set; }
        public DateTime CreationDAte { get; set; } = DateTime.Now;
        public virtual List<PermissionGroup>? PermissionGroup { get; set; }
    }
}
