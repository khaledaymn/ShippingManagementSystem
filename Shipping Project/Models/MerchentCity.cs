using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shipping_Project.Models
{
    [PrimaryKey(nameof(MerchentId),nameof(CityId))]
    public class MerchentCity
    {
        public double SpecialPreice { get; set; }
        [ForeignKey("Merchent")]
        public int MerchentId { get; set; }
        [ForeignKey("City")]
        public int CityId { get; set; }
        public virtual Merchent? Merchent { get; set; }
        public virtual City? City { get; set; }
    }
}
