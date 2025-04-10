using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shipping_Project.DTOs;
using Shipping_Project.Models;
using Shipping_Project.UnitOfWork;
using Shipping_Project.Specifications.Params;
using Shipping_Project.Specifications;
namespace Shipping_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BranchesController : ControllerBase
    {
        private readonly UnitOfWork.UnitOfWork unit;

        public BranchesController(Shipping_Project.UnitOfWork.UnitOfWork unit )
        {
            this.unit = unit;
        }
        [HttpPost("ADD Branche")]
        public async Task< ActionResult> ADD(BrancheDTO branchefromRequest)
        {
            if(ModelState.IsValid)
            {
                Branches branches = new Branches();
                branches.Name = branchefromRequest.Name;
                branches.CreationDate = branchefromRequest.CreationDate;
                branches.IsDeleted = branchefromRequest.IsDeleted;
                branches.Location = branchefromRequest.Location;
                branches.CityId = branchefromRequest.CityId;
                await  unit.Repository<Branches>().ADD(branches);
                await  unit.Save();
                return Ok(branchefromRequest);
            }
            return BadRequest(); 
        }
        [HttpGet]
        public async Task< ActionResult> GetAll([FromQuery]BranchParams Params)
        {
            var Spec = new BranchSpecification(Params);
           var branches = await unit.Repository<Branches>().GetAllAsyncBySpec(Spec);

           List <BrancheDTO> brancheDTO = new List<BrancheDTO>(); 
           if(branches is not null)
            {
                foreach (var branche in branches)
                {
                    Shipping_Project.DTOs.BrancheDTO b = new BrancheDTO();
                    b.BrancheID = branche.ID;
                    b.Name = branche.Name;
                    b.IsDeleted = branche.IsDeleted;
                    b.Location = branche.Location;
                    b.CreationDate = branche.CreationDate;
                    b.CityId =branche.CityId;
                    brancheDTO.Add(b);
                }
                return Ok(brancheDTO);
                
            }
            return BadRequest();
        }
        [HttpPut("{id:int}Update")]
        public async Task< ActionResult> Update( int id ,BrancheDTO fromRequest)
        { 
            Branches branches = await unit.Repository<Branches>().GetById(id);
            if(branches is null)
            {
                return BadRequest();
            }
            branches.Name = fromRequest.Name;
            branches.IsDeleted = fromRequest.IsDeleted;
            branches.CreationDate = fromRequest.CreationDate;
            branches.Location = fromRequest.Location;
            branches.CityId = fromRequest.CityId;
            unit.Repository<Branches>().Update(branches);
            await unit.Save();
            return Ok(fromRequest);
        }
        [HttpDelete("{id:int}Delete")]
        public async Task< ActionResult> Delete(int id)
        {
            Branches branches = await unit.Repository<Branches>().GetById(id);
            if(branches is null)
            {
                return BadRequest();
            }
            unit.Repository<Branches>().Delete(id);
            await unit.Save();
            return Ok("Deleted Done");
        }
    }
}