namespace Shipping_Project.DTOs
{
    public class ShippingRepresentativeUpdateDTO
    {
        public int ID { get; set; }  // Required for update
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? Password { get; set; }  // Only update if provided
        public List<int>? BranchIds { get; set; }  // Optional
        public List<int>? GovernorateIds { get; set; }  // Optional
        public string? DiscountType { get; set; }
        public double? CompanyPersentage { get; set; }
    }

}
