using Shipping_Project;
using Microsoft.AspNetCore.Mvc;
using Shipping_Project.DTOs;
using Microsoft.AspNetCore.Identity;
using Shipping_Project.Models;
using Microsoft.AspNetCore.Authorization;
using Shipping_Project.Helper;
using System.Text.RegularExpressions;
using System.Transactions;
using Shipping_Project.Extend;

namespace Shipping_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShippingRepresentativeController : ControllerBase
    {
        private readonly UnitOfWork.UnitOfWork _unitOfWork;
        private readonly UserManager<ApplicationUser> _userManager;
        public ShippingRepresentativeController(UnitOfWork.UnitOfWork unitOfWork, UserManager<ApplicationUser> userManager)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
        }

        #region Create ShippingRepresentative

        [HttpPost]
        //[Authorize(Roles = HelperClass.AdminRole)]
        [Route("~/ShippingRepresentative/Create")]
        public async Task<IActionResult> Create(ShippingRepresentativeDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest("Invalid data.");

            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
                return BadRequest("Email is already registered.");

            // Create User
            var user = new ApplicationUser
            {
                Name = dto.Name,
                UserName = Regex.Replace(dto.Name, @"[^a-zA-Z0-9]", ""),
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                Address = dto.Address
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            // Create Shipping Representative
            var shippingRepresentative = new ShippigRepresentative
            {
                UserID = user.Id,
                DiscountType = Enum.Parse<DiscountType>(dto.DiscountType.ToLower()),
                CompanyPersentage = dto.CompanyPersentage
            };

            await _unitOfWork.Repository<ShippigRepresentative>().ADD(shippingRepresentative);
            await _unitOfWork.Save();

            // Link Shipping Representative to Multiple Branches
            if (dto.BranchIds != null && dto.BranchIds.Any())
            {
                foreach (var branchId in dto.BranchIds)
                {
                    var userBranch = new UserBranches
                    {
                        UserId = user.Id,
                        BranchId = branchId
                    };
                    await _unitOfWork.Repository<UserBranches>().ADD(userBranch);
                }
            }
            else
            {
                return BadRequest("Branches are required.");
            }

            // Link Shipping Representative to Multiple Governorates
            if (dto.GovernorateIds != null && dto.GovernorateIds.Any())
            {
                foreach (var governorateId in dto.GovernorateIds)
                {
                    var shippingRepGov = new ShippingRepGovernorate
                    {
                        ShippingRepId = shippingRepresentative.UserID,
                        GovernorateId = governorateId
                    };
                    await _unitOfWork.Repository<ShippingRepGovernorate>().ADD(shippingRepGov);
                }
            }
            else
            {
                return BadRequest("Governorates are required.");
            }

            await _unitOfWork.Save();

            return Created($"/api/shippingRepresentatives/{shippingRepresentative.UserID}", shippingRepresentative);
        }

        #endregion


        #region Update ShippingRepresentative

        [HttpPut]
        //[Authorize(Roles = HelperClass.AdminRole)]
        [Route("~/ShippingRepresentative/Update")]
        public async Task<IActionResult> Update(ShippingRepresentativeUpdateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest("Invalid data.");

            var shippingRepresentative = await _unitOfWork.Repository<ShippigRepresentative>().GetById(dto.ID);
            if (shippingRepresentative == null)
                return NotFound("Shipping Representative not found.");

            var user = await _userManager.FindByIdAsync(shippingRepresentative.UserID);
            if (user == null)
                return NotFound("User not found.");

            if (!string.IsNullOrEmpty(dto.Name))
            {
                user.Name = dto.Name;
                user.UserName = Regex.Replace(dto.Name, @"[^a-zA-Z0-9]", "");
            }
            if (!string.IsNullOrEmpty(dto.Email))
                user.Email = dto.Email;

            if (!string.IsNullOrEmpty(dto.PhoneNumber))
                user.PhoneNumber = dto.PhoneNumber;

            if (!string.IsNullOrEmpty(dto.Address))
                user.Address = dto.Address;

            if (!string.IsNullOrEmpty(dto.Password))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                await _userManager.ResetPasswordAsync(user, token, dto.Password);
            }

            await _userManager.UpdateAsync(user);

            if (!string.IsNullOrEmpty(dto.DiscountType))
                shippingRepresentative.DiscountType = Enum.Parse<DiscountType>(dto.DiscountType);

            if (dto.CompanyPersentage.HasValue)
                shippingRepresentative.CompanyPersentage = dto.CompanyPersentage.Value;

            _unitOfWork.Repository<ShippigRepresentative>().Update(shippingRepresentative);
            await _unitOfWork.Save();

            if (dto.BranchIds != null)
            {
                var userBranches = await _unitOfWork.Repository<UserBranches>().GetAll();
                if (userBranches.Any())
                {
                    foreach (var userBranch in userBranches)
                    {
                        _unitOfWork.Repository<UserBranches>().Delete(userBranch.BranchId);
                    }
                }
                foreach (var branchId in dto.BranchIds)
                {
                    await _unitOfWork.Repository<UserBranches>().ADD(new UserBranches { UserId = user.Id, BranchId = branchId });
                }
            }

            if (dto.GovernorateIds != null)
            {
                var shippingRepGovernorates = await _unitOfWork.Repository<ShippingRepGovernorate>().GetAll();
                if (shippingRepGovernorates.Any())
                {
                    foreach (var shippingRepGovernorate in shippingRepGovernorates)
                    {
                        _unitOfWork.Repository<ShippingRepGovernorate>().Delete(shippingRepGovernorate.GovernorateId);
                    }
                }
                foreach (var governorateId in dto.GovernorateIds)
                {
                    await _unitOfWork.Repository<ShippingRepGovernorate>().ADD(new ShippingRepGovernorate
                    {
                        ShippingRepId = shippingRepresentative.UserID,
                        GovernorateId = governorateId
                    });
                }
            }

            await _unitOfWork.Save();

            return Ok("Shipping Representative updated successfully.");
        }


        #endregion


        #region Delete ShippingRepresentative

        [HttpDelete]
        //[Authorize(Roles = HelperClass.AdminRole)]
        [Route("~/ShippingRepresentative/Delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            // Find the shipping representative
            var shippingRepresentative = await _unitOfWork.Repository<ShippigRepresentative>().GetById(id);
            if (shippingRepresentative == null)
                return NotFound("Shipping Representative not found.");

            // Find the associated user
            var user = await _userManager.FindByIdAsync(shippingRepresentative.UserID);
            if (user == null || user.IsDeleted)
                return NotFound("User not found or already deleted.");

            // Mark the user as deleted
            user.IsDeleted = true;
            await _userManager.UpdateAsync(user);

            // Save changes
            await _unitOfWork.Save();

            return Ok("Shipping Representative marked as deleted.");
        }

        #endregion


        #region Get ShippingRepresentative By ID

        [HttpGet]
        // [Authorize(Roles = HelperClass.AdminRole)]
        [Route("~/ShippingRepresentative/GetById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var shippingRepresentative = await _unitOfWork.Repository<ShippigRepresentative>().GetById(id);

            if (shippingRepresentative == null || shippingRepresentative.User == null || shippingRepresentative.User.IsDeleted)
                return NotFound("Shipping Representative not found or has been deleted.");

            var result = new
            {
                ID = shippingRepresentative.UserID,
                Name = shippingRepresentative.User.Name,
                Email = shippingRepresentative.User.Email,
                PhoneNumber = shippingRepresentative.User.PhoneNumber,
                Branches = shippingRepresentative.User.UserBranches.Select(ub => ub.Branches.Name).ToList(),
                CompanyPercentage = shippingRepresentative.CompanyPersentage,
                Status = !shippingRepresentative.User.IsDeleted ? "Active" : "Inactive"
            };

            return Ok(result);
        }






        #endregion


        #region Get All ShippingRepresentatives
        [HttpGet]
        //[Authorize(Roles = HelperClass.AdminRole)]
        [Route("~/ShippingRepresentative/GetAll")]
        public async Task<IActionResult> GetAll()
        {
            var shippingRepresentatives = await _unitOfWork.Repository<ShippigRepresentative>()
                .GetAll();

            var activeRepresentatives = shippingRepresentatives
                .Where(rep => rep.User != null && !rep.User.IsDeleted)
                .Select(rep => new
                {
                    ID = rep.UserID,
                    Name = rep.User.Name,
                    Email = rep.User.Email,
                    PhoneNumber = rep.User.PhoneNumber,
                    Branches = rep.User.UserBranches.Select(ub => ub.Branches.Name).ToList(),
                    CompanyPercentage = rep.CompanyPersentage,
                    Status = !rep.User.IsDeleted ? "Active" : "Inactive"
                })
                .ToList();

            if (!activeRepresentatives.Any())
                return NotFound("No active Shipping Representatives found.");

            return Ok(activeRepresentatives);
        }


        #endregion
    }
}
