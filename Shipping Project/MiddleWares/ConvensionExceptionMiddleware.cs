using APIsLayer.Errors;
using Microsoft.AspNetCore.Diagnostics;
using System.Text.Json;

namespace APIsLayer.MiddleWares
{
    public class ConvensionExceptionMiddleWare
    {
        private readonly RequestDelegate next;
        private readonly ILogger<ConvensionExceptionMiddleWare> logger;
        private readonly IWebHostEnvironment env;

        public ConvensionExceptionMiddleWare(RequestDelegate next, ILogger<ConvensionExceptionMiddleWare> logger ,IWebHostEnvironment env )
        {
            this.next = next;
            this.logger = logger;
            this.env = env;
        }
        public async Task InvokeAsync(HttpContext httpcontext)
        {
            try
            {
                await next.Invoke(httpcontext);
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
                httpcontext.Response.StatusCode = 500;
                httpcontext.Response.ContentType = "application/json";
                var response = env.IsDevelopment() ? new APIResponceExceptionError(500, ex.Message, ex.StackTrace.ToString()) : new APIResponceExceptionError(500);
                var options = new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                var jsonresponse = JsonSerializer.Serialize(response, options);
                await httpcontext.Response.WriteAsync(jsonresponse);
            }
        }
    }
}
