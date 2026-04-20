using Airbnb.Application.Dtos.Auth;
using Airbnb.Application.Interfaces;
using Airbnb.Presentation.Models;
using Microsoft.AspNetCore.Mvc;

namespace Airbnb.Presentation.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Authentication");

        // Registro
        group.MapPost("/register", async (RegisterDto dto, IAuthService authService) =>
        {
            await authService.RegisterAsync(dto);
            return Results.Ok(ApiResponse<object>.Success(new { message = "Registro exitoso. Revisa tu correo para confirmar tu cuenta." }));
        });

        // Iniciar sesion
        group.MapPost("/login", async (LoginDto dto, IAuthService authService) =>
        {
            var response = await authService.LoginAsync(dto);
            return Results.Ok(ApiResponse<AuthResponseDto>.Success(response));
        });

        // Confirmar cuenta
        group.MapGet("/confirm", async ([FromQuery] string token, IAuthService authService) =>
        {
            await authService.ConfirmAccountAsync(token);
            return Results.Ok(ApiResponse<object>.Success(new { message = "Cuenta confirmada exitosamente. Ya puedes iniciar sesión." }));
        });
    }
}