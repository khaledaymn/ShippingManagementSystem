using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shipping_Project.DTOs;
using Shipping_Project.IGenaricRepository;
using Shipping_Project.Models;
using Shipping_Project.Repository;
using Shipping_Project.UnitOfWork;

namespace Shipping_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GovernorateController : ControllerBase
    {
        private readonly IGenaricRepo<Governorate> _governorate;

        public GovernorateController(IGenaricRepo<Governorate> GenaricRepo)
        {
            _governorate = GenaricRepo;
        }

        // Get All Governorate
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var governorates = await _governorate.GetAll();
            return Ok(governorates);
        }

        // Get Governorate by Id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var governorate = await _governorate.GetById(id);
            if (governorate == null)
                return NotFound("Governorate not found.");
            return Ok(governorate);
        }

        // Add a new Governorate
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] Governorate gov)
        {
            if (gov == null)
                return BadRequest("Invalid data.");

            await _governorate.ADD(gov);
             _governorate.Save();   
            return Ok(new { message = "Governorate added successfully!" });
        }

        // Update an existing governorate
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Governorate gov)
        {
            try
            {
                _governorate.Update(gov);
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