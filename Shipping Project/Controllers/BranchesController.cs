using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shipping_Project.DTOs;
using Shipping_Project.Models;
using Shipping_Project.UnitOfWork;
using Shipping_Project.Specifications.Params;
using Shipping_Project.Specifications;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using APIsLayer.Errors;
using Shipping_Project.DTOs.MerchantDtos;
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
        [HttpPost]
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
        // Get All Without Pagination
        [HttpGet("withOutPagination")]
        public async Task<ActionResult> GetAllWithOutPagination()
        {
            var branches= await unit.Repository<Branches>().GetAll();
            if(branches is null)
            {
                return BadRequest();
            }
            List<BrancheDTO> brancheDTO = new List<BrancheDTO>();
            foreach (var branche in branches) 
            {
                BrancheDTO b = new BrancheDTO();
                b.BrancheID = branche.ID;
                b.Name = branche.Name;
                b.IsDeleted = branche.IsDeleted;
                b.Location = branche.Location;
                b.CreationDate = branche.CreationDate;
                b.CityId = branche.CityId;
                brancheDTO.Add(b);
            }
            return Ok(brancheDTO); 
        }
        [HttpGet]
        public async Task< ActionResult> GetAll([FromQuery]BranchParams Params)
        {
            var Spec = new BranchSpecification(Params);
           var branches = await unit.Repository<Branches>().GetAllAsyncBySpec(Spec);
            var countSpec = new BranchPaginationForCount(Params);
            var count = await unit.Repository<Branches>().GetCountAsync(countSpec);

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
        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(int id)
        {
            var branche = await unit.Repository<Branches>().GetById(id);
            if(branche is null)
            {
                return BadRequest(new APIResponse(400));
            }
            Shipping_Project.DTOs.BrancheDTO b = new BrancheDTO();
            b.BrancheID = branche.ID;
            b.Name = branche.Name;
            b.IsDeleted = branche.IsDeleted;
            b.Location = branche.Location;
            b.CreationDate = branche.CreationDate;
            b.CityId = branche.CityId;
            return Ok(b);
        }
        [HttpPut("{id:int}")]
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
        [HttpDelete]
        public async Task< ActionResult> Delete(int id)
        {
            Branches branches = await unit.Repository<Branches>().GetById(id);
            if(branches is null)
            {
                return BadRequest();
            }
            branches.IsDeleted=true;
            unit.Repository<Branches>().Update(branches);
            await unit.Save();
            return Ok(new { isDeleted = true });
        }
    }
}