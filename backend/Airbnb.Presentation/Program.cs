using System.Text;
using Airbnb.Application.Interfaces;
using Airbnb.Application.Services;
using Airbnb.Domain.Entities;
using Airbnb.Domain.Interfaces;
using Airbnb.Infrastructure.Persistence;
using Airbnb.Infrastructure.Repositories;
using Airbnb.Infrastructure.Security;
using Airbnb.Infrastructure.Services;
using Airbnb.Presentation.Endpoints;
using Airbnb.Presentation.Middlewares; 
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AirbnbDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Add services to the container.
builder.Services.AddOpenApi();

// Manejador de Excepciones Global y ProblemDetails
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Configuración de Autenticación JWT
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Falta la clave JWT");
var issuer = builder.Configuration["Jwt:Issuer"];
var audience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
builder.Services.AddAuthorization(); // Habilita el control de acceso por roles

// Inyección de Dependencias
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IPropertyRepository, PropertyRepository>();
builder.Services.AddScoped<IReservationRepository, ReservationRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRepository<PropertyImage>, Repository<PropertyImage>>();
builder.Services.AddScoped<IRepository<PropertyBlock>, Repository<PropertyBlock>>();

builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<ITokenProvider, TokenProvider>();
builder.Services.AddScoped<IFileStorageService, LocalFileStorageService>();

builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPropertyService, PropertyService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseExceptionHandler(); // Activamos el manejador de excepciones

app.MapGet("/api/status", () =>
{
   return "ok";
});

// Activamos los middlewares de seguridad - El orden importa, por eso puse api/status antes para saber si esta ok
app.UseAuthentication(); 
app.UseAuthorization();  
app.UseStaticFiles();

// Registramos los Endpoints
app.MapAuthEndpoints();
app.MapUserEndpoints();
app.MapPropertyEndpoints();
// app.MapReservationEndpoints(); // Descomenta esto cuando tengas tus ReservationEndpoints listos

app.Run();