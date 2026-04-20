using System.Security.Claims;
using Airbnb.Application.Dtos.User;
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

        group.MapGet("/me", [Authorize] async (ClaimsPrincipal user, IUserService userService) =>
        {
            var userId = user.GetUserId();
            var userData = await userService.GetUserByIdAsync(userId);
            
            return Results.Ok(ApiResponse<UserResponseDto>.Success(userData));
        });

        group.MapPost("/become-host", [Authorize] async (ClaimsPrincipal user, IUserService userService) =>
        {
            var userId = user.GetUserId();
            
            await userService.BecomeHostAsync(userId);
            
            return Results.Ok(ApiResponse<object>.Success(new 
            { 
                message = "¡Felicidades! Ahora eres un anfitrión. Por favor, inicia sesión nuevamente para actualizar tus permisos." 
            }));
        });
    }
}