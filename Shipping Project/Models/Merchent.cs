using Castle.Components.DictionaryAdapter;
using Microsoft.EntityFrameworkCore;
using Shipping_Project.DTOs.MerchantDtos;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shipping_Project.Models
{
   
    public class Merchant
    {
        public Merchant()
        {

        }
        public Merchant( string id,MerchantDtoForAdding Merchanttoadd)
        {
            this.UserID = id;
            this.StoreName = Merchanttoadd.StoreName;
            this.RejectedOrederPercentage = Merchanttoadd.RejectedOrderPrecentage;
            this.SpecialPickUp = Merchanttoadd.SpecialPickUp;
        }

        [System.ComponentModel.DataAnnotations.Key]
        public string UserID { get; set; }
        public string StoreName { get; set; }
        public double RejectedOrederPercentage { get; set; }

        public int? SpecialPickUp { get; set; }
        [ForeignKey("UserID")]
        public virtual ApplicationUser User { get; set; }
        public virtual List<MerchantCity>? MerchantCities { get; set; } = new List<MerchantCity>();
        public virtual List<Order> MerchantOrders { get; } = new List<Order>();
    }
}
