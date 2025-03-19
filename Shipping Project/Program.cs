
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shipping_Project.Mapping;
using Shipping_Project.Models;
using Shipping_Project.UnitOfWork;

namespace Shipping_Project
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();
            builder.Services.AddScoped<Shipping_Project.UnitOfWork.UnitOfWork>();
            builder.Services.AddAutoMapper(typeof(Program));
            builder.Services.AddDbContext<ShippingContext>(op =>
            {
                op.UseLazyLoadingProxies().UseSqlServer(builder.Configuration.GetConnectionString("Default"));
            });
            builder.Services.AddIdentity<ApplicationUser, IdentityRole>(op =>
            {
                op.Password.RequireLowercase=false;
                op.Password.RequireUppercase=false;
                op.Password.RequireNonAlphanumeric=false;
            }).AddEntityFrameworkStores<ShippingContext>();

            var app = builder.Build();
            using var Scope = app.Services.CreateScope();
            var services = Scope.ServiceProvider;
            var db = services.GetRequiredService<ShippingContext>();
            var loggerfactory = services.GetRequiredService<ILoggerFactory>();
            try
            {
                await db.Database.MigrateAsync(); //Update Data Base 
            }
            catch (Exception ex)
            {
                var logger = loggerfactory.CreateLogger<Program>();
                logger.LogError(ex, "Error During Applay Migtaion");
            }
            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.UseSwaggerUI(op => op.SwaggerEndpoint("/openapi/v1.json", "v1"));
            }

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
