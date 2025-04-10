using APIsLayer.Errors;
using CoreLayer.Specifications;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Shipping_Project.DTOs;
using Shipping_Project.Extend;
using Shipping_Project.Models;
using Shipping_Project.Specifications;
using Shipping_Project.Specifications.Params;
using System.Text.RegularExpressions;



namespace Shipping_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private readonly UnitOfWork.UnitOfWork unit;
        private readonly UserManager<ApplicationUser> _userManager;

        public EmployeeController(UnitOfWork.UnitOfWork unit,UserManager<ApplicationUser> _userManager)
        {
            this.unit = unit;
            this._userManager = _userManager;
        }
        // Add Employee
        [HttpPost]
        public async Task<ActionResult> AddEmpolyee(AddEmployeeDTO DTO)
        {
            if(!ModelState.IsValid)
            {
                return BadRequest(new APIResponse(400));
            }
            //var existingUser = await _userManager.FindByEmailAsync(DTO.Email);
            //if (existingUser != null)
            //    return BadRequest("Email is already registered.");


            // Creat User 

            var NewUser = new ApplicationUser()
            {
                Name=DTO.Name,
                UserName = DTO.UserName,
                Email =DTO.Email,
                PasswordHash=DTO.Password,
                PhoneNumber =DTO.PhoneNumber,
                IsDeleted =DTO.IsDeleted,
            };
            var Result =  await _userManager.CreateAsync(NewUser,DTO.Password);
            if (!Result.Succeeded)
            {
                var errors = string.Join("; ", Result.Errors.Select(e => e.Description));
                return BadRequest(new APIResponse(400, $"Create failed: {errors}"));
            }
            //Creat Employee

            var Employee = new Employee()
            {
                UserID = NewUser.Id,
            };

           await unit.Repository<Employee>().ADD(Employee);
           await unit.Save();

            if(DTO.BranchIds is not null)
            {
                foreach(var branch in DTO.BranchIds)
                {
                    var b = new UserBranches()
                    {
                        BranchId = branch,
                        UserId = NewUser.Id,
                    };
                    await unit.Repository<UserBranches>().ADD(b);
                }
            }
            else
            {
                return BadRequest("Branches are required.");
            }
            await unit.Save();

            return Ok("Employee Created Done");
        }
        //Get All Employee 
        [HttpGet]
        public async Task<ActionResult> GetAll([FromQuery]  EmployeeParams param)
        {
          var Spec = new EmployeeSpecfication(param);
          var AllEmp=   await unit.Repository<Employee>().GetAllAsyncBySpec(Spec);
          var ObjToReturn = new List<GetAllEmployeeDTO>();
            foreach(var emp in AllEmp)
            {
                var employee = new GetAllEmployeeDTO()
                {
                    Name=emp.User.Name,
                    BrachName=emp.User.UserBranches.Select(e=>e.Branches.Name).FirstOrDefault(),
                    Email=emp.User.Email,
                    IsDeleted=emp.User.IsDeleted,
                    PhoneNumber = emp.User.PhoneNumber
                };
                ObjToReturn.Add(employee);
            }
            return Ok(ObjToReturn); 
        }
        //Get Employee By Id 
        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(string id )
        {
            var Spec = new EmployeeSpecfication(p=>p.UserID==id);
            var employee = await unit.Repository<Employee>().GetAsyncBySpec(Spec);
            if (employee != null)
            {
                var emp =await _userManager.FindByIdAsync(id);
                if (emp != null)
                {
                    var r = new GetAllEmployeeDTO()
                    {
                        Name = emp.Name,
                        Email = emp.Email,
                        IsDeleted = emp.IsDeleted,
                        BrachName = emp.UserBranches.Select(s => s.Branches.Name).FirstOrDefault(),
                        PhoneNumber = emp.PhoneNumber
                    };
                    return Ok(r);
                }
            }
            return BadRequest(new APIResponse(400));
        }
        // Update Employee
        [HttpPut]
        public async Task<ActionResult> Update([FromQuery] string id , UpdateEmployeeDTO DTO)
        {
            var Spec = new EmployeeSpecfication(p => p.UserID == id);
            var employee = await unit.Repository<Employee>().GetAsyncBySpec(Spec);
            if (employee != null)
            {
                var emp = await _userManager.FindByIdAsync(id);
                if (emp != null)
                {
                    emp.Name = DTO.Name;
                    emp.UserName=DTO.UserName;
                    emp.Email = DTO.Email;
                    emp.PhoneNumber = DTO.PhoneNumber;
                    unit.Repository<Employee>().Update(employee);
                    await unit.Save();
                    return Ok(DTO);
                }
            }
            return BadRequest();
        }
        // Delete Employee
        [HttpDelete]
        public async Task<ActionResult> Delete(string id)
        {
            var Emp = await unit.Repository<ApplicationUser>().GetAsyncBySpec( new BaseSpecifiction<ApplicationUser> (p=>p.Id==id));
            if (Emp != null)
            {
                Emp.IsDeleted = true;
                unit.Repository<ApplicationUser>().Update(Emp);
                await unit.Save();
                return Ok("Deleted Done");
            }
            return BadRequest(new APIResponse(400));
        }
    }
}