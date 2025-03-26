namespace Shipping_Project.DTOs
{
    public class BrancheDTO
    {
        public int BrancheID { get; set; }
        public string Name { get; set; }
        public DateTime CreationDate { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; }
        public string Location { get; set; }
        public int CityId { get; set; }
    }
}
