using APIsLayer.Errors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Shipping_Project.DTOs.MerchantDtos;
using Shipping_Project.DTOs.OrderDtos;
using Shipping_Project.Helper;
using Shipping_Project.Models;

namespace Shipping_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly UnitOfWork.UnitOfWork unit;

        public OrderController(UnitOfWork.UnitOfWork unit)
        {
            this.unit = unit;
        }
        [HttpPost("Add")]
        public async Task<ActionResult> Add(AddedOrderDto model)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(new APIResponse(400, "Invalid request data"));
            }


            using var transaction = await unit.BeginTransactionAsync();
            try
            {
                var chargePrice = await model.CalculatePrice(unit);
                var amountReceived = chargePrice + await model.CalculateAmountRecived();

                var order = new Order()
                {
                    orderDate = DateTime.Now,
                    OrderState = OrderState.New,
                    OrderType = model.OrderType,
                    CustomerName = model.CustomerName,
                    CustomerPhone1 = model.CustomerPhone1,
                    CustomerPhone2 = model.CustomerPhone2,
                    CityId = model.CityId,
                    BranchId = model.BranchId,
                    Notes = model.Notes,
                    PaymentType = model.PaymentType,
                    ShippingToVillage = model.ShippingToVillage,
                    VillageAndStreet = model.VillageAndStreet,
                    ChargeTypeId = model.ChargeTypeId,
                    MerchantId = model.MerchantId,
                    OrderPrice = model.OrderPrice,
                    TotalWeight = (int)model.TotalWeight,
                    ChargePrice = chargePrice,
                    AmountReceived = amountReceived

                };
                await unit.Repository<Order>().ADD(order);
                var  result = await unit.Save();
                if (!(result>0))
                {
                    return BadRequest(new APIResponse(400, "User creation failed"));
                }

                if(model.Products.Count > 0)
                {
                    var products = model.Products.Select(p => new Product()
                    {
                        Name = p.Name,
                        Quantity = p.Quantity,
                        Weight =(int)p.Weight,
                        OrderId = order.ID
                    }).ToList();
                    await unit.Repository<Product>().AddRange(products);
                    result = await unit.Save();
                    if (!(result > 0))
                    {
                        return BadRequest(new APIResponse(400, "order creation failed"));
                    }
                }

                await transaction.CommitAsync();

                return Ok(new APIResponse(200, "Order created successfully"));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();

                return StatusCode(500, new APIResponse(500, "An error occurred while Adding Order"));
            }
        }
    }
}