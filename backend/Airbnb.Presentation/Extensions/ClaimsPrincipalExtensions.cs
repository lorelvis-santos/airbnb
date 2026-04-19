using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Airbnb.Domain.Enum;
using Airbnb.Domain.Exceptions;

namespace Airbnb.Presentation.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var claim = principal.FindFirst(ClaimTypes.NameIdentifier) ?? principal.FindFirst(JwtRegisteredClaimNames.Sub);
        
        if (claim == null || !Guid.TryParse(claim.Value, out var userId))
        {
            throw new AppException(ErrorType.Unauthorized, "Token inválido o sin ID de usuario.");
        }
        
        return userId;
    }
}