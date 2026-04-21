using System.Security.Claims;
using Airbnb.Application.Dtos.Reservation;
using Airbnb.Application.Dtos.Review;
using Airbnb.Application.Interfaces;
using Airbnb.Presentation.Extensions;
using Airbnb.Presentation.Models;
using Microsoft.AspNetCore.Authorization;

namespace Airbnb.Presentation.Endpoints;

public static class ReservationEndpoints
{
    public static void MapReservationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/reservations").WithTags("Reservations");

        // Obtener las reservaciones como Huésped
        group.MapGet("/my-reservations", [Authorize] async (ClaimsPrincipal user, IReservationService service) =>
        {
            var guestId = user.GetUserId();
            var reservations = await service.GetMyReservationsAsync(guestId);
            return Results.Ok(ApiResponse<object>.Success(reservations));
        });

        // Obtener las reservaciones de una propiedad como Anfitrión
        group.MapGet("/property/{propertyId}", [Authorize(Roles = "Host")] async (Guid propertyId, ClaimsPrincipal user, IReservationService service) =>
        {
            var hostId = user.GetUserId();
            var reservations = await service.GetReservationsByPropertyAsync(propertyId, hostId);
            return Results.Ok(ApiResponse<object>.Success(reservations));
        });

        // Crear una nueva reserva
        group.MapPost("/", [Authorize] async (CreateReservationDto dto, ClaimsPrincipal user, IReservationService service) =>
        {
            dto.GuestId = user.GetUserId();
            
            var reservation = await service.CreateReservationAsync(dto);
            return Results.Created($"/api/reservations/{reservation.Id}", ApiResponse<object>.Success(reservation));
        });

        // Cancelacion de una reserva
        group.MapPatch("/{id}/cancel", [Authorize] async (Guid id, ClaimsPrincipal user, IReservationService service) =>
        {
            var userId = user.GetUserId();
            await service.CancelReservationAsync(id, userId);
            
            return Results.Ok(ApiResponse<object>.Success(new { message = "Reserva cancelada correctamente." }));
        });

        // Completar reserva
        group.MapPatch("/{id}/complete", [Authorize] async (Guid id, ClaimsPrincipal user, IReservationService service) =>
        {
            var userId = user.GetUserId();
            await service.CompleteReservationAsync(id, userId);
            return Results.Ok(ApiResponse<object>.Success(new { message = "Reserva completada exitosamente." }));
        });

        // Dejar reseña
        group.MapPost("/{id}/reviews", [Authorize] async (
            Guid id, 
            CreateReviewDto dto, 
            ClaimsPrincipal user, 
            IReviewService service) =>
        {
            var guestId = user.GetUserId();
            var review = await service.CreateReviewAsync(id, guestId, dto);
            return Results.Created($"/api/reservations/{id}/reviews/{review.Id}", ApiResponse<object>.Success(review));
        });
    }
}