using Shipping_Project.Models;

namespace Shipping_Project.DTOs.BranchesDtos
{
    public class branchDtoForMerchant
    {
        public branchDtoForMerchant()
        {
            
        }
        public branchDtoForMerchant(Branches bran)
        {
            this.BrancheID = bran.ID;
            this.Name = bran.Name;
        }
        public int BrancheID { get; set; }
        public string? Name { get; set; }
    }
}
