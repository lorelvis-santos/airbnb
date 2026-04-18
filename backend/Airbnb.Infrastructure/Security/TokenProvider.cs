using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Airbnb.Application.Interfaces;
using Airbnb.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Airbnb.Infrastructure.Security;

public class TokenProvider : ITokenProvider
{
    private readonly IConfiguration _configuration;

    public TokenProvider(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        var key = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Falta la clave JWT en la configuración");
        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];
        var expirationInMinutes = int.Parse(_configuration["Jwt:ExpirationInMinutes"]  ?? "120");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Name, user.FullName)
        };

        foreach (var role in user.Roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role.ToString()));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(expirationInMinutes),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = credentials
        };

        var handler = new JwtSecurityTokenHandler();
        var token = handler.CreateToken(tokenDescriptor);

        return handler.WriteToken(token);
    }
}