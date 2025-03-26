using Microsoft.EntityFrameworkCore;
using Shipping_Project.DTOs;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shipping_Project.Models
{
    [PrimaryKey(nameof(MerchantId),nameof(CityId))]
    public class MerchantCity
    {
        public MerchantCity()
        {
            
        }
        public MerchantCity(string Merchantid, SpecialDeliveryPriceForMerchant sp)
        {
            this.MerchantId = Merchantid;
            this.CityId = sp.cityId;
            this.SpecialPreice = sp.SpecialPreice;
        }
        public double SpecialPreice { get; set; }
        [ForeignKey("Merchant")]
        public string MerchantId { get; set; }
        [ForeignKey("City")]
        public int CityId { get; set; }
        public virtual Merchant? Merchant { get; set; }
        public virtual City? City { get; set; }
    }
}
