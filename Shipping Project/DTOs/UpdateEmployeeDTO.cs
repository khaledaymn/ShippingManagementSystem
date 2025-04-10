namespace Shipping_Project.DTOs
{
    public class UpdateEmployeeDTO
    {

        public string ID { get; set; }  // Required for update
        public string? Name { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public List<int>? BranchIds { get; set; }  // Optional

    }
}
