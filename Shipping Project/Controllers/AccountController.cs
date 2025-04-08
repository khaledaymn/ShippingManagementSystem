using APIsLayer.DTOs.Identity;
using APIsLayer.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using Shipping_Project.DTOs.Identity;
using Shipping_Project.DTOs.ResetPasswordDtos;
using Shipping_Project.IdentityServices.contracts;
using Shipping_Project.IdentityServices.ServiceImplementation;
using Shipping_Project.Models;
using System.Net;
using System.Security.Claims;
using System.Text;

namespace Shipping_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly ITokenServices token;
        private readonly SignInManager<ApplicationUser> signInManager;
        private readonly IEmailServicescs emailServices;
        private readonly IOptions<AppSetting> appsetting;
        private readonly AppSetting _appsetting;

        public AccountController(UserManager<ApplicationUser> _userManager, ITokenServices _token, SignInManager<ApplicationUser> _signInManager,IEmailServicescs emailServices, IOptions<AppSetting> appsetting)
        {
            userManager = _userManager;
            token = _token;
            signInManager = _signInManager;
            this.emailServices = emailServices;
            this.appsetting = appsetting;
            _appsetting = appsetting.Value;
        }
        
        [HttpPost("Login")]
        public async Task<ActionResult<UserDtocs>> Login(LoginUserDto model)
        {
            var user = await userManager.FindByEmailAsync(model.Email);
            if (user == null) { return Unauthorized(new APIResponse(401)); }
            if (user.IsDeleted)
            {
                return Unauthorized(new { message = "user Not authorized" });
            }
            var result = await signInManager.PasswordSignInAsync(
                user,
                model.Password,
                model.RememberMe, 
                lockoutOnFailure: false);

            if (!result.Succeeded) { return Unauthorized(new APIResponse(401)); }
            var ReturnedUser = new UserDtocs()
            {
                DiaplyName = user.Name,
                Email = user.Email,
                Token = await token.CreateToken(user, userManager)
            };
            return Ok(ReturnedUser);
        }
        
        [Authorize]
        [HttpPut("ChangePassword")]
        public async Task<ActionResult<APIResponse>> ChangePassword(UserToChangePasswordDTO model)
        {
            var Token = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            
            bool isTokenInvalidated =  await token.IsTokenInvalidatedAsync(Token);
            if (isTokenInvalidated)
            {
                return Unauthorized(new APIResponse(401, "Invalid or expired token. Please log in again."));
            }

            var userEmail = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(userEmail))
                return Unauthorized(new APIResponse(401, "Invalid user credentials"));

            var user = await userManager.FindByEmailAsync(userEmail);
            if (user == null)
                return NotFound(new APIResponse(404, "User not found"));

            if (!ModelState.IsValid)
                return BadRequest(new APIResponse(400, "Invalid request"));

            var result = await userManager.ChangePasswordAsync(user, model.OldPassword, model.NewPassword);

            if (!result.Succeeded)
            {
              
                return BadRequest(new APIResponse(400, "Password change failed"));
            }

            return Ok(new APIResponse(200, "Password changed successfully"));
        }
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] DTOs.ResetPasswordDtos.ForgotPasswordRequest request)
        {
            
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return BadRequest(new APIResponse(400,"Invalid Email"));

            
            var Token = await userManager.GeneratePasswordResetTokenAsync(user);
            if(string.IsNullOrEmpty(Token))
                return BadRequest(new APIResponse(400, "Token generation failed"));
            //var encodedToken = WebUtility.UrlEncode(Token);
            var resetUrl = $"{_appsetting.WebAppUrl}/reset-password?token={Token}&email={WebUtility.UrlEncode(user.Email)}";


            var email = new Email
            {
                To = user.Email,
                Subject = "Password Reset Request",
                Body = $@"
                Password Reset
                Please click the link below to reset your password:
                {resetUrl}
               
               If you didn't request this, please ignore this email"
            };

            emailServices.SendEmail(email);

            return Ok();
        }
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(DTOs.ResetPasswordDtos.ResetPasswordRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new APIResponse(400,ModelState.ToString()));

            var user = await userManager.FindByEmailAsync(request.Email);
            if(user == null)
                return BadRequest(new APIResponse(400, "Invalid Email"));
            
            if (!await userManager.VerifyUserTokenAsync(user,
     userManager.Options.Tokens.PasswordResetTokenProvider,
     "ResetPassword",
     request.Token))
            {
                return BadRequest(new APIResponse(400, "Invalid or expired token"));
            }
            var result = await userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);

            if (!result.Succeeded)
                return BadRequest(new APIResponse(400, string.Join(", ", result.Errors.Select(e => e.Description))));

            return Ok("Password has been reset successfully");
        }
        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            
            var Token = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            
            var isInvalidated = await token.IsTokenInvalidatedAsync(Token);
            if (isInvalidated)
            {
                return Unauthorized(new APIResponse(401, "Token has been invalidated"));
            }

            await token.InvalidateTokenAsync(Token);

            return Ok(new { Message = "Logout successful" });
        }
    }
    }
