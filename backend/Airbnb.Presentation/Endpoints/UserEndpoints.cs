using System.Security.Claims;
using Airbnb.Application.Interfaces;
using Airbnb.Presentation.Extensions;
using Airbnb.Presentation.Models;
using Microsoft.AspNetCore.Authorization;

namespace Airbnb.Presentation.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/users").WithTags("Users");

        // Fíjate en el atributo [Authorize]: Esto rechaza peticiones sin JWT automáticamente
        group.MapPost("/become-host", [Authorize] async (ClaimsPrincipal user, IUserService userService) =>
        {
            // 1. Extraemos el ID del token de forma segura
            var userId = user.GetUserId();
            
            // 2. Ejecutamos la lógica
            await userService.BecomeHostAsync(userId);
            
            // 3. Respondemos
            return Results.Ok(ApiResponse<object>.Success(new 
            { 
                message = "¡Felicidades! Ahora eres un anfitrión. Por favor, inicia sesión nuevamente para actualizar tus permisos." 
            }));
        });
    }
}