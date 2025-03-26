using APIsLayer.Errors;
using AutoMapper;
using CoreLayer.Specifications;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shipping_Project.DTOs;

using Shipping_Project.Models;
using Shipping_Project.Specifications;
using Shipping_Project.Specifications.Params;
using Shipping_Project.UnitOfWork;

namespace Shipping_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MerchantController : ControllerBase
    {
        private readonly UnitOfWork.UnitOfWork unit;
        private readonly UserManager<ApplicationUser> user;

        public MerchantController(UnitOfWork.UnitOfWork unit, UserManager<ApplicationUser> user)
        {
            this.unit = unit;
            this.user = user;
        }
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<MerchantReponseForPagniation<MerchantDTO>>>> GetAll([FromQuery] MerchantParams Params)
        {
            try
            {
                MerchantSpecfications spec = new MerchantSpecfications(Params);
                var Merchants = await unit.Repository<Merchant>().GetAllAsyncBySpec(spec);

                var merchantsDTO = Merchants.Select(m => new MerchantDTO(m)).ToList();
                var countSpec = new MerchantPaginationForCount(Params);
                var count = await unit.Repository<Merchant>().GetCountAsync(countSpec);

                return Ok(new MerchantReponseForPagniation<MerchantDTO>(Params.PageSize, Params.PageIndex, count, merchantsDTO));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIResponse(500, "An error occurred while processing your request."));

            }
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<MerchecntForEditingAndGetting>> Get(string id)
        {
            MerchantSpecfications spec = new MerchantSpecfications(m => m.UserID == id);
            var Merchant = await unit.Repository<Merchant>().GetAsyncBySpec(spec);
            if (Merchant != null)
            {
                var user = await this.user.FindByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new APIResponse(404, "User not found."));
                }

                var userBranches = await unit.Repository<UserBranches>().GetAllAsyncBySpec(new BaseSpecifiction<UserBranches>(u => u.UserId == id));
                var branchIds = userBranches.Select(ub => ub.BranchId).ToList();

                var MerchantCities = await unit.Repository<MerchantCity>().GetAllAsyncBySpec(new BaseSpecifiction<MerchantCity>(c => c.MerchantId == Merchant.User.Id));
                
                var specialDeliveryPrices = MerchantCities.Select(mc => new SpecialDeliveryPriceForMerchant { cityId = mc.CityId }).ToList();

                var MerchantDto = new MerchecntForEditingAndGetting
                {
                    Id = user.Id,
                    Address = user.Address,
                    UserName = user.UserName,
                    Email = user.Email,
                    SpecialPickUp=Merchant.SpecialPickUp,
                    StartWorkDDate = user.HiringDate,
                    PhoneNumber = user.PhoneNumber,
                    StoreName = Merchant.StoreName,
                    BranchesIds = branchIds,
                    Name = user.Name,
                    SpecialDeliveryPrices = specialDeliveryPrices ?? new List<SpecialDeliveryPriceForMerchant>()
                };

                return Ok(MerchantDto);
            }
            return NotFound(new APIResponse(404));
        }
        //[HttpPost]
        //public async Task<ActionResult> Add(MerchantDtoForAdding AddingMerchant)
        //{
        //    try
        //    {
        //        ApplicationUser Addeduser = new ApplicationUser(AddingMerchant);
        //        IdentityResult result = await user.CreateAsync(Addeduser, Addeduser.PasswordHash);
        //        if (result.Succeeded)
        //        {
        //            Merchant addedMerchant = new Merchant(Addeduser.Id, AddingMerchant);
        //            await unit.Repository<Merchant>().ADD(addedMerchant);
        //            var Result = await unit.Save();

        //            if (Result > 0)
        //            {

        //                List<UserBranches> userbranches = AddingMerchant.BranchesIds.Select(b => new UserBranches(Addeduser.Id, b)).ToList();
        //                if(AddingMerchant.SpecialDeliveryPrices.Count>0)
        //                {
        //                    var Merchantspecialprices = AddingMerchant.SpecialDeliveryPrices.Select(s => new MerchantCity(addedMerchant.UserID, s)).ToList();
        //                    await unit.Repository<MerchantCity>().AddRange(Merchantspecialprices);

        //                }

        //                await unit.Repository<UserBranches>().AddRange(userbranches);
        //                await unit.Save();
        //            }
        //            return Ok();
        //        }
        //        else
        //        {
        //            return StatusCode(500, new APIResponse(500, "An error occurred while processing your request."));

        //        }

        //    }
        //    catch
        //    {
        //        return StatusCode(500, new APIResponse(500, "An error occurred while processing your request."));
        //    }
        //}
        [HttpPost]
        public async Task<ActionResult> Add(MerchantDtoForAdding AddingMerchant)
        {
           
            if (!ModelState.IsValid)
            {
                return BadRequest(new APIResponse(400, "Invalid request data"));
            }

            
            using var transaction = await unit.BeginTransactionAsync();
            try
            {
                
                var newUser = new ApplicationUser(AddingMerchant);
                var identityResult = await user.CreateAsync(newUser, newUser.PasswordHash);

                if (!identityResult.Succeeded)
                {
                    return BadRequest(new APIResponse(400, "User creation failed"));
                }

                
                var newMerchant = new Merchant(newUser.Id, AddingMerchant);
                await unit.Repository<Merchant>().ADD(newMerchant);

               
                if (AddingMerchant.BranchesIds?.Count > 0)
                {
                    var userBranches = AddingMerchant.BranchesIds
                        .Select(branchId => new UserBranches(newUser.Id, branchId))
                        .ToList();

                    await unit.Repository<UserBranches>().AddRange(userBranches);
                }

                
                if (AddingMerchant.SpecialDeliveryPrices?.Count > 0)
                {
                    var merchantCities = AddingMerchant.SpecialDeliveryPrices
                        .Select(s => new MerchantCity(newMerchant.UserID, s))
                        .ToList();

                    await unit.Repository<MerchantCity>().AddRange(merchantCities);
                }

               
                var saveResult = await unit.Save();
                await transaction.CommitAsync();

                return Ok(new APIResponse(200, "Merchant created successfully"));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                
                return StatusCode(500, new APIResponse(500, "An error occurred while creating merchant"));
            }
        }
        [HttpPut]
        public async Task<ActionResult> Edit( MerchecntForEditingAndGetting updatedMerchant)
        {
            
            try
            {
                var existingMerchant = await unit.Repository<Merchant>().GetAsyncBySpec(new MerchantSpecfications(m => m.UserID == updatedMerchant.Id));
                if (existingMerchant == null)
                {
                    return NotFound(new APIResponse(404, "Merchant not found."));
                }

               
                existingMerchant.StoreName = updatedMerchant.StoreName;
                existingMerchant.RejectedOrederPercentage = updatedMerchant.RejectedOrderPrecentage;
                existingMerchant.SpecialPickUp = updatedMerchant.SpecialPickUp;

                
                var existingUser = await user.FindByIdAsync(updatedMerchant.Id);
                if (existingUser == null)
                {
                    return NotFound(new APIResponse(404, "User not found."));
                }
                existingUser.Address = updatedMerchant.Address;
                existingUser.UserName = updatedMerchant.UserName;
                existingUser.Email = updatedMerchant.Email;
                existingUser.PhoneNumber = updatedMerchant.PhoneNumber;
               


                var userUpdateResult = await user.UpdateAsync(existingUser);
                if (!userUpdateResult.Succeeded)
                {
                    return StatusCode(500, new APIResponse(500, "Failed to update user."));
                }

                
                var existingUserBranches = await unit.Repository<UserBranches>().GetAllAsyncBySpec( new BaseSpecifiction<UserBranches>(u=>u.UserId==existingMerchant.UserID));
                unit.Repository<UserBranches>().DeleteRange(existingUserBranches);
                var newUserBranches = updatedMerchant.BranchesIds.Select(b => new UserBranches(updatedMerchant.Id, b)).ToList();
                await unit.Repository<UserBranches>().AddRange(newUserBranches);

               
                var existingMerchantCities = await unit.Repository<MerchantCity>().GetAllAsyncBySpec(new BaseSpecifiction<MerchantCity>(c => c.MerchantId == existingMerchant.UserID));
                if(existingMerchantCities.Count>0)
                    unit.Repository<MerchantCity>().DeleteRange(existingMerchantCities);
                if(updatedMerchant.SpecialDeliveryPrices.Count>0)
                {
                    var newMerchantCities = updatedMerchant.SpecialDeliveryPrices.Select(s => new MerchantCity(existingMerchant.UserID, s)).ToList();
                    await unit.Repository<MerchantCity>().AddRange(newMerchantCities);
                }
                

                unit.Repository<Merchant>().Update(existingMerchant);
                await unit.Save();
               

                return Ok();
            }
            catch (Exception ex)
            {
               
                return StatusCode(500, new APIResponse(500, "An error occurred while processing your request."));
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            try
            {
                var existingMerchant = await unit.Repository<ApplicationUser>().GetAsyncBySpec(new BaseSpecifiction<ApplicationUser>(m => m.Id == id));
                if (existingMerchant == null)
                {
                    return NotFound(new APIResponse(404, "Merchant not found."));
                }

                existingMerchant.IsDeleted = true;

                unit.Repository<ApplicationUser>().Update(existingMerchant);
                await unit.Save();

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIResponse(500, "An error occurred while processing your request."));
            }
        }



    }
}
