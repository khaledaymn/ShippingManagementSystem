using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.IdentityModel.Tokens;
using Shipping_Project.IdentityServices.contracts;
using Shipping_Project.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Shipping_Project.IdentityServices.ServiceImplementation
{
    public class TokenServices:ITokenServices
    {
        private readonly IDistributedCache _cache;
       
        private readonly IConfiguration config;

        public TokenServices(IConfiguration config, IDistributedCache cache)
        {
            this.config = config;
            _cache = cache;
        }
        public async Task<string> CreateToken(ApplicationUser user, UserManager<ApplicationUser> _userManager)
        {
            //privateClaims
            var AuthClaims = new List<Claim>
           {
               new Claim(ClaimTypes.Email,user.Email),
               new Claim(ClaimTypes.GivenName,user.UserName),
               new Claim(ClaimTypes.Name,user.Name),
                new Claim(ClaimTypes.NameIdentifier,user.Id),
                new Claim(ClaimTypes.MobilePhone,user.PhoneNumber),
                new Claim("IsDeleted",user.IsDeleted.ToString()),
                new Claim("HiringDate",user.HiringDate.ToString()),

           };
            //Key
            var Authkey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["JWT:Key"]));
            var Token = new JwtSecurityToken(
                issuer: config["JWT:Issuer"],
                audience: config["JWT:Audience"],
                expires: DateTime.Now.AddMinutes(int.Parse(config["JWT:ExpireTimeByMinutes"])),
                claims: AuthClaims,
                signingCredentials: new SigningCredentials(Authkey, SecurityAlgorithms.HmacSha256Signature)

                );
            return new JwtSecurityTokenHandler().WriteToken(Token);
        }

        public async Task InvalidateTokenAsync(string token)
        {
            var expiry = GetTokenExpiry(token);
            await _cache.SetStringAsync($"invalidated_token:{token}", "1", new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiry - DateTime.UtcNow
            });
        }
        public async Task<bool> IsTokenInvalidatedAsync(string token)
        {
            return await _cache.GetStringAsync($"invalidated_token:{token}") != null;
        }
        private DateTime GetTokenExpiry(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            return jwtToken.ValidTo;
        }
    }
}
