using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PizzaWebApp.Data;
using System.Configuration;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.Mvc;
using System.IO.Compression;
using System.Linq;
using Microsoft.AspNetCore.Http;
using PizzaWebApp.Shared;
using Microsoft.AspNetCore.Authentication.Cookies;
using PizzaWebApp.Services;

var builder = WebApplication.CreateBuilder(args);


// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    //options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
    options.JsonSerializerOptions.Converters.Add(new JsonStringGuidConverter());
    options.JsonSerializerOptions.PropertyNamingPolicy = null; // сохранить имена свойств
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull; // убрать null
    options.JsonSerializerOptions.WriteIndented = true; // отступы в json
});
builder.Services.AddHttpClient();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
    options.AddPolicy("AllowYandexAPI", builder =>
    {
        builder.WithOrigins("https://suggest-maps.yandex.ru")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

builder.Services.AddControllers();

// Добавляем обработку БД только если строка подключения существует
try
{
    var connectionString = builder.Configuration.GetConnectionString("PizzaConnection");
    if (!string.IsNullOrEmpty(connectionString))
    {
        builder.Services.AddDbContext<PizzaDbContext>(options =>
            options.UseNpgsql(connectionString));
    }
    else
    {
        Console.WriteLine("ВНИМАНИЕ: Строка подключения к БД не найдена. БД не будет подключена.");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Ошибка при настройке подключения к БД: {ex.Message}");
}

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Добавляем поддержку статических файлов
builder.Services.AddDirectoryBrowser();

// Add services to DI container
builder.Services.AddScoped<ApiClient>();
builder.Services.AddScoped<MenuService>();

var app = builder.Build();

// Создаем директорию wwwroot, если ее нет
if (!Directory.Exists("wwwroot"))
{
    Directory.CreateDirectory("wwwroot");
}

// Создаем простой health-check файл 
if (!File.Exists("wwwroot/health-minimal.html"))
{
    File.WriteAllText("wwwroot/health-minimal.html", "<html><body>OK</body></html>");
}

// УСИЛЕННЫЙ HEALTH CHECK - отвечает на ЛЮБОЙ запрос со словом "health" или корневой путь
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";
    
    // Отвечаем OK на запросы к корню или содержащие "health"
    if (path == "/" || path.Contains("health"))
    {
        context.Response.StatusCode = 200;
        context.Response.ContentType = "text/plain";
        await context.Response.WriteAsync("OK");
        return;
    }
    
    await next();
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Добавляем обработку статических файлов перед другими middleware
app.UseDefaultFiles();
app.UseStaticFiles();

// Добавляем дополнительный middleware для обработки SPA
app.Use(async (context, next) =>
{
    await next();

    // Если это запрос к несуществующему файлу API, то возвращаем index.html
    if (context.Response.StatusCode == 404 && 
        !context.Request.Path.Value.StartsWith("/api") && 
        !Path.HasExtension(context.Request.Path.Value))
    {
        context.Request.Path = "/index.html";
        await next();
    }
});

// Добавляем простой health endpoint
app.MapGet("/api/health", () => Results.Ok("OK"));

// Добавляем обработку для health-minimal.html напрямую
app.MapGet("/health-minimal.html", () => Results.Content("<html><body>OK</body></html>", "text/html"));

// Маппинг корневого пути
app.MapGet("/", () => Results.Content("<html><body>OK</body></html>", "text/html"));

app.UseHttpsRedirection();

app.UseCors("AllowAll");
app.UseCors("AllowYandexAPI");

app.UseAuthorization();

app.MapControllers();

app.Run();

public class JsonStringGuidConverter : JsonConverter<Guid>
{
    public override Guid Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return Guid.Parse(reader.GetString());
    }

    public override void Write(Utf8JsonWriter writer, Guid value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString());
    }
}