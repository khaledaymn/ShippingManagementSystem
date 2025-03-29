using CoreLayer.Specifications;
using Shipping_Project.DTOs.OrderDtos;
using Shipping_Project.Models;
using Shipping_Project.Specifications;
using Shipping_Project.UnitOfWork;
using System.Threading.Tasks;

namespace Shipping_Project.Helper
{
    public  static class CalculateChargePrice
    {
        

       
        public static async Task<double> CalculatePrice(this AddedOrderDto model, UnitOfWork.UnitOfWork unit)
        {
            double chargePrice = 0;

            try
            {
                BaseSpecifiction<MerchantCity> spec = new BaseSpecifiction<MerchantCity>(m => m.CityId == model.CityId && m.MerchantId == model.MerchantId);
                var statndaredKPIs = await unit.Repository<Standard>().GetAll();
                var statndaredKPIsForChargePrice = statndaredKPIs.FirstOrDefault();
                var PriceForcityObject = await unit.Repository<MerchantCity>().GetAllAsyncBySpec(spec);
                var priceForCity = PriceForcityObject.FirstOrDefault();
                var CitySpec = new BaseSpecifiction<City>(c => c.ID == model.CityId);
                var PriceForCityObjList = await unit.Repository<City>().GetAllAsyncBySpec(CitySpec);
                var priceForCityob = PriceForCityObjList.FirstOrDefault();
                MerchantSpecfications merchspec = new MerchantSpecfications(m => m.UserID == model.MerchantId);
                var Merchant = await unit.Repository<Merchant>().GetAsyncBySpec(merchspec);
                var chargeTypeSpec = new BaseSpecifiction<ChargeType>(c => c.ID == model.ChargeTypeId);
                var chargetype = await unit.Repository<ChargeType>().GetAsyncBySpec(chargeTypeSpec);

                if (priceForCity == null)
                {
                    chargePrice += priceForCityob.ChargePrice;
                }
                else
                {
                    chargePrice += priceForCity.SpecialPreice;
                }
                if (model.ShippingToVillage)
                {
                    chargePrice += statndaredKPIsForChargePrice.VillagePrice;
                }
                if (model.TotalWeight > statndaredKPIsForChargePrice.StandardWeight)
                {
                    var extraWeight = model.TotalWeight - statndaredKPIsForChargePrice.StandardWeight;
                    var extraPrice = extraWeight * statndaredKPIsForChargePrice.KGprice;
                    chargePrice += extraPrice;
                }
                if (model.OrderType == OrderType.PickupFromTheMerchant)
                {
                    if (Merchant.SpecialPickUp != null)
                    {
                        chargePrice += (double)Merchant.SpecialPickUp;
                    }
                    else
                    {
                        chargePrice += priceForCityob.PickUpPrice;
                    }
                }
                chargePrice += chargetype.ExtraPrice;
                return chargePrice;
            }
            catch
            {
                throw new Exception("Error in calculating charge price");
            }


        }
        public static async Task<double> CalculateAmountRecived(this AddedOrderDto model)
        {
           switch(model.PaymentType)
            {
                case PaymentType.CashOnDelivery:
                    return model.OrderPrice;
                case PaymentType.ExchangeOrder:
                    return 0;
                default:
                    return 0;
            }
        }
    }
}
