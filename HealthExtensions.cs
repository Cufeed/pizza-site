using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Text.Json;
using System.Threading.Tasks;

namespace PizzaWebApp
{
    public static class HealthExtensions
    {
        public static IApplicationBuilder UseHealthChecks(this IApplicationBuilder app)
        {
            app.MapGet("/health", async context =>
            {
                await context.Response.WriteAsync("Healthy");
            });
            
            return app;
        }
    }
} 