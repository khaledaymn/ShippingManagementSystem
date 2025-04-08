using Microsoft.AspNetCore.Identity;
using Shipping_Project.Extend;
using Shipping_Project.Models;

namespace Shipping_Project.IdentityServices.contracts
{
    public interface ITokenServices
    {
        public Task<string> CreateToken( ApplicationUser user, UserManager<ApplicationUser> _userManager);
         public Task InvalidateTokenAsync(string token);
       public  Task<bool> IsTokenInvalidatedAsync(string token);
    }
}
