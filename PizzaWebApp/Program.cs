using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PizzaWebApp.Data;
using System.Configuration;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

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

// Для измения имени строки подключения Railway
try
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? 
                          builder.Configuration.GetConnectionString("PizzaConnection");
    
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

builder.Services.AddDirectoryBrowser();

var app = builder.Build();

if (!Directory.Exists("wwwroot"))
{
    Directory.CreateDirectory("wwwroot");
}

// Health-check
if (!File.Exists("wwwroot/health-minimal.html"))
{
    File.WriteAllText("wwwroot/health-minimal.html", "<html><body>OK</body></html>");
}

// Для railway
if (!File.Exists("wwwroot/health.html"))
{
    File.WriteAllText("wwwroot/health.html", "<html><body>Healthy</body></html>");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();

// health endpoint
app.MapGet("/health", () => Results.Content("<html><body>Healthy</body></html>", "text/html"));
app.MapGet("/api/health", () => Results.Json(new { status = "Healthy" }));

app.UseCors("AllowAll");

app.UseAuthentication();
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