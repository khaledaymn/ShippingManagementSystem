using System.ComponentModel.DataAnnotations.Schema;

namespace Shipping_Project.Models
{
    public class Order :BaseModel
    {
        public string CustomerName { get; set; }
        public string CustomerPhone1 { get; set; }
        public string? CustomerPhone2 { get; set; }
        public string VillageAndStreet { get; set; }
        public string Notes { get; set; }
        public double FinalCost { get; set; }
        public OrderState OrderState { get; set; }
        public OrderType OrderType { get; set; }
        public PaymentType PaymentType { get; set; }
        public double OrderPrice { get; set; }
        public int TotalWeight { get; set; }
        public bool IsDeleted { get; set; }=false;
        public bool ShippingToVillage { get; set; }
        public double AmountReceived { get; set; }
        //[ForeignKey("City")]
        //public int CityId { get; set; }
        //public virtual City? City { get; set; }
        [ForeignKey("ChargeType")]
        public int ChargeTypeId { get; set; }
        public virtual ChargeType? ChargeType { get; set; }
        public virtual List<Product>? Products { get; }=new List<Product>();
        [ForeignKey("RejectedReason")]
        public int? RrjectedResonId { get; set; } = null;
        public virtual RejectedReason? RejectedReason { get; set; }
        [ForeignKey("Branches")]
        public int BranchId { get; set; }
        public virtual Branches? Branches { get; set; }
        [ForeignKey("Merchent")]
        public int MerchentId { get; set; }
        public virtual Merchent? Merchent { get; set; }
        [ForeignKey("ShippigRepresentive")]
        public int ShippigRepresentiveId { get; set; }
        public virtual ShippigRepresentive? ShippigRepresentive { get; set; }

    }
    public enum OrderState
    {
        New,
        Pendding,
        DeliveredToTheRepresentative,
        Delivered,
        CannotBeReached,
        PostPoned,
        PartiallyDelivered,
        CanceledByCustomer,
        RejectedWithPayment,
        RejectedWithPartialPayment,
        RejectedWithoutPayment
    }
    public enum OrderType
    {
        DeliveryAtBranch,
        PickupFromTheMerchant
    }
    public enum PaymentType
    {
        CashOnDelivery,
        PaidInAdvance,
        ExchangeOrder,
    }
}
