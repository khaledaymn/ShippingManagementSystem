#region Usings

using APIsLayer.Errors;
using APIsLayer.MiddleWares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Shipping_Project.Extend;
using Shipping_Project.IdentityServices.contracts;
using Shipping_Project.IdentityServices.ServiceImplementation;
using Shipping_Project.IGenaricRepository;
using Shipping_Project.Mapping;
using Shipping_Project.Models;
using Shipping_Project.Repository;
using Shipping_Project.UnitOfWork;
using System.Reflection;
using System.Text;

#endregion

#region Create Builder
var builder = WebApplication.CreateBuilder(args);

#endregion

#region Services

#region API Configration

// Add services to the container.
builder.Services.AddControllers();

#endregion


#region OpenAPI Configration
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

#endregion


#region Swagger Configration

builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v1",
        Title = "Shiping Management System",
        Description = "API documentation for Shiping Management System",
        TermsOfService = new Uri("https://example.com/terms"),
        Contact = new OpenApiContact
        {
            Name = "Khaled Ayman",
            Email = "khaled654ayman0@gmail.com"
        }
        //License = new OpenApiLicense
        //{
        //    Name = "Not Found any license",
        //    Url = new Uri("https://example.com/license")
        //}
    });

    // JWT Authentication setup
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 12345abcdef\"",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });

    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Name = "Bearer",
                In = ParameterLocation.Header
            },
            new List<string>()
        }
    });

    // Enable XML comments if available
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    option.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));

});
#endregion


#region Dependancy Injection Configration
builder.Services.AddScoped<UnitOfWork>();
builder.Services.AddScoped(typeof(IGenaricRepo<>), typeof(GenaricRepo<>));




#endregion


#region ValidationError
builder.Services.Configure<ApiBehaviorOptions>(Options =>
{
    Options.InvalidModelStateResponseFactory = (ActionContext) =>
    {
        var errors = ActionContext.ModelState.Where(p => p.Value.Errors.Count() > 0).SelectMany(p => p.Value.Errors).Select(e => e.ErrorMessage).ToArray();
        var reponse = new APIResponseValidationError(errors);
        return new BadRequestObjectResult(reponse);
    };
});
#endregion

//builder.Services.AddAutoMapper(typeof(Program));

#region Database Configration

builder.Services.AddDbContext<ShippingContext>(op =>
{
    op.UseLazyLoadingProxies().UseSqlServer(builder.Configuration.GetConnectionString("Default"));
});

#endregion


#region Identity Configration
//builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
//{
//    options.Password.RequireLowercase = false;
//    options.Password.RequireUppercase = false;
//    options.Password.RequireNonAlphanumeric = false;
//    //options.Password.RequireDigit = true;
//    //options.Password.RequireLowercase = true;
//    //options.Password.RequireNonAlphanumeric = true;
//    //options.Password.RequireUppercase = true;
//    //options.Password.RequiredLength = 8;
//    //options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(1);
//    //options.Lockout.MaxFailedAccessAttempts = 5;
//    //options.Lockout.AllowedForNewUsers = true;
//    //options.User.RequireUniqueEmail = true;
//}).AddEntityFrameworkStores<ShippingContext>()
// .AddTokenProvider<DataProtectorTokenProvider<ApplicationUser>>(TokenOptions.DefaultProvider);

builder.Services.AddScoped<ITokenServices, TokenServices>();
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Tokens.PasswordResetTokenProvider = "passwordreset";
}).AddEntityFrameworkStores<ShippingContext>().AddDefaultTokenProviders().AddTokenProvider<DataProtectorTokenProvider<ApplicationUser>>("passwordreset"); ;
builder.Services.AddAuthentication(o =>
{
    o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(o => {
    o.TokenValidationParameters
    = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JWT:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JWT:Audience"],
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"]))
    };
});
builder.Services.AddDistributedMemoryCache();
builder.Services.Configure<EmailSetting>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddTransient<IEmailServicescs, EmailServices>();
builder.Services.Configure<AppSetting>(builder.Configuration.GetSection("AppSettings"));

#endregion


#endregion

#region Build
var app = builder.Build();
#endregion

#region Update-Database

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

#endregion

#region Check Environment
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        var prefix = string.IsNullOrEmpty(options.RoutePrefix) ? "." : "..";
        options.SwaggerEndpoint($"{prefix}/swagger/v1/swagger.json", "Shiping Management System v1");
        options.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
        options.DisplayRequestDuration();
    });
}
#endregion

#region Middlewares
app.UseMiddleware<ConvensionExceptionMiddleWare>();
app.UseAuthorization();

app.MapControllers();

app.Run();

#endregion