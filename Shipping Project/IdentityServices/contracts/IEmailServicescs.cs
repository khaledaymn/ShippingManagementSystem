using Shipping_Project.Models;

namespace Shipping_Project.IdentityServices.contracts
{
    public interface IEmailServicescs
    {
        public void SendEmail(Email email);
    }
}
