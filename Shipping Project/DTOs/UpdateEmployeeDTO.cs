namespace Shipping_Project.DTOs
{
    public class UpdateEmployeeDTO
    {
        public string? Name { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public bool IsDeleted { get; set; }
        public List<int>? BranchIds { get; set; }  // Optional
        public int GroupId { get; set; }   
    }
}
