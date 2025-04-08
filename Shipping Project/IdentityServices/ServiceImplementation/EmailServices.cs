using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MimeKit;
using Shipping_Project.IdentityServices.contracts;
using Shipping_Project.Models;
using System.Net.Mail;

namespace Shipping_Project.IdentityServices.ServiceImplementation
{
    public class EmailServices : IEmailServicescs
    {
        private readonly EmailSetting options;

        public EmailServices(IOptions<EmailSetting> _options)
        {
            options = _options.Value;
        }
        public void SendEmail(Email email)
        {
            var mail  = new MimeMessage()
            {
                Sender= MailboxAddress.Parse(options.Email),
                Subject = email.Subject,
            };
            mail.To.Add(MailboxAddress.Parse(email.To));
            var builder= new BodyBuilder();
            builder.TextBody = email.Body;
            mail.Body = builder.ToMessageBody();
            mail.From.Add(new MailboxAddress(options.DisplayName, options.Email));
            using var smtp =new MailKit.Net.Smtp.SmtpClient();
            smtp.Connect(options.Host, int.Parse(options.Port), MailKit.Security.SecureSocketOptions.StartTls);
            smtp.Authenticate(options.Email, options.Password);
            smtp.Send(mail);
            smtp.Disconnect(true);
        }
    }
}
