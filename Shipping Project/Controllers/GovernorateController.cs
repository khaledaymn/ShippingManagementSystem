﻿using APIsLayer.Errors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shipping_Project.DTOs;
using Shipping_Project.DTOs.MerchantDtos;
using Shipping_Project.IGenaricRepository;
using Shipping_Project.Models;
using Shipping_Project.Repository;
using Shipping_Project.Specifications.Params;
using Shipping_Project.Specifications;
using Shipping_Project.UnitOfWork;

namespace Shipping_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GovernorateController : ControllerBase
    {
        private readonly IGenaricRepo<Governorate> _governorate;
        private readonly Shipping_Project.UnitOfWork.UnitOfWork _unitOfWork;

        public GovernorateController(IGenaricRepo<Governorate> GenaricRepo, UnitOfWork.UnitOfWork _unitOfWork)
        {
            _governorate = GenaricRepo;
            _unitOfWork = _unitOfWork;
        }

        // Get All Governorate
        [HttpGet]
        //public async Task<IActionResult> GetAll()
        //{
        //    //var governorates = await _governorate.GetAll();
        //    var governorates = _unitOfWork.Repository<Governorate>().GetAll();
        //    return Ok(governorates);
        //}

        public async Task<ActionResult<IReadOnlyList<GovernoratePaginationForCount<Governorate>>>> GetAll([FromQuery] MerchantParams Params)
        {
            try
            {
                GovernorateSpecifications spec = new GovernorateSpecifications(Params);
                var governorates = await _unitOfWork.Repository<Governorate>().GetAllAsyncBySpec(spec);

                var Governorate = governorates.Select(g => new GovernorateDTO(g)).ToList();
                var countSpec = new MerchantPaginationForCount(Params);
                var count = await _unitOfWork.Repository<Merchant>().GetCountAsync(countSpec);

                return Ok(new GovernoratePaginationForCount<GovernorateDTO>(Params.PageSize, Params.PageIndex, count, Governorate));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIResponse(500, "An error occurred while processing your request."));

            }
        }



        // Get Governorate by Id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var governorate = _unitOfWork.Repository<Governorate>().GetById(id);
            if (governorate == null)
                return NotFound("Governorate not found.");
            return Ok(governorate);
        }

        // Add a new Governorate
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] GovernorateDTO govDTO)
        {
            if (govDTO == null)
                return BadRequest("Invalid data.");

            _unitOfWork.Repository<GovernorateDTO>().ADD(govDTO);
            // _governorate.Save();
            _unitOfWork.Save();
            return Ok(new { message = "Governorate added successfully!" });
        }

        // Update an existing governorate
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] GovernorateDTO govDTO)
        {
            try
            {
                _unitOfWork.Repository<GovernorateDTO>().Update(govDTO);
                _governorate.Save();
                return Ok(new { message = "Governorate updated successfully!" });
            }
            catch (Exception)
            {
                return NotFound("Governorate not found.");
            }
        }

        // Delete a governorate
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
               var governorate= await _governorate.GetById(id);
                governorate.IsDeleted = true;
                _governorate.Update(governorate);
                _governorate.Save();
                return Ok(new { message = "Governorate deleted successfully!" });
            }
            catch (Exception)
            {
                return NotFound("Governorate not found.");
            }
        }
    }
}