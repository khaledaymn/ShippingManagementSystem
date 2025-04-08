using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Shipping_Project.Models;

namespace Shipping_Project.Helper
{
    public static  class IdentityExtensions
    {
        

        public static async Task<bool> CheckEmailExists(this string email,UserManager<ApplicationUser> userManager)
        {
            var result = await userManager.FindByEmailAsync(email);
            if (result == null) {return false; }
            return true;
        }
    }
}
