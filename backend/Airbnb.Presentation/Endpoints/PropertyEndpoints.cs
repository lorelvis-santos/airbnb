// Airbnb.Presentation/Endpoints/PropertyEndpoints.cs
using System.Security.Claims;
using Airbnb.Application.Dtos.Property;
using Airbnb.Application.Interfaces;
using Airbnb.Presentation.Extensions;
using Airbnb.Presentation.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Airbnb.Presentation.Endpoints;

public static class PropertyEndpoints
{
    public static void MapPropertyEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/properties").WithTags("Properties");

        // Endpoints solo para anfitriones

        group.MapPost("/", [Authorize(Roles = "Host")] async (CreatePropertyDto dto, ClaimsPrincipal user, IPropertyService service) =>
        {
            var hostId = user.GetUserId();
            var property = await service.CreatePropertyAsync(dto, hostId);
            return Results.Ok(ApiResponse<object>.Success(property));
        });

        group.MapPut("/{id}", [Authorize(Roles = "Host")] async (Guid id, UpdatePropertyDto dto, ClaimsPrincipal user, IPropertyService service) =>
        {
            var hostId = user.GetUserId();
            var property = await service.UpdatePropertyAsync(id, dto, hostId);
            return Results.Ok(ApiResponse<object>.Success(property));
        });

        group.MapDelete("/{id}", [Authorize(Roles = "Host")] async (Guid id, ClaimsPrincipal user, IPropertyService service) =>
        {
            var hostId = user.GetUserId();
            await service.DeletePropertyAsync(id, hostId);
            return Results.Ok(ApiResponse<object>.Success(new { message = "Propiedad eliminada correctamente." }));
        });

        // Obtener mis propiedades como Host
        group.MapGet("/my-properties", [Authorize(Roles = "Host")] async (ClaimsPrincipal user, IPropertyService service) =>
        {
            var hostId = user.GetUserId();
            var properties = await service.GetPropertiesByHostAsync(hostId);
            return Results.Ok(ApiResponse<object>.Success(properties));
        });


        // Endpoints para los guests
        group.MapGet("/search", [Authorize] async (
            [FromQuery] string? city, 
            [FromQuery] string? province, 
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate, 
            [FromQuery] int? capacity, 
            IPropertyService service) =>
        {
            var properties = await service.SearchAvailablePropertiesAsync(city, province, startDate, endDate, capacity);
            return Results.Ok(ApiResponse<object>.Success(properties));
        });

        group.MapPost("/{id}/images", [Authorize(Roles = "Host")] async (
            Guid id, 
            IFormFileCollection files, 
            ClaimsPrincipal user, 
            IPropertyService service) =>
        {
            var hostId = user.GetUserId();

            // Mapeo seguro: Extraemos el Stream y la extensión sin enviar objetos HTTP a la capa de Aplicación
            var fileData = files.Select(f => (f.OpenReadStream(), Path.GetExtension(f.FileName))).ToList();

            var imageUrls = await service.UploadPropertyImagesAsync(id, hostId, fileData);

            return Results.Ok(ApiResponse<object>.Success(new { urls = imageUrls }));
        }).DisableAntiforgery();

        group.MapDelete("/{id}/images/{imageId}", [Authorize(Roles = "Host")] async (
            Guid id, 
            Guid imageId, 
            ClaimsPrincipal user, 
            IPropertyService service
        ) =>
        {
            var hostId = user.GetUserId();
            
            await service.DeletePropertyImageAsync(id, imageId, hostId);
            
            return Results.Ok(ApiResponse<object>.Success(new { message = "Imagen eliminada correctamente." }));
        });
    }
}