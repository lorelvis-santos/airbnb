// Airbnb.Presentation/Endpoints/ReservationEndpoints.cs
using Airbnb.Application.Dtos;
using Airbnb.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Airbnb.Presentation.Endpoints;

public static class ReservationEndpoints
{
    public static void MapReservationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/reservations").WithTags("Reservations");

        // Crear una nueva reserva
        group.MapPost("/", async (CreateReservationDto dto, IReservationService service) =>
        {
            try 
            {
                var reservation = await service.CreateReservationAsync(dto);
                return Results.Created($"/api/reservations/{reservation.Id}", reservation);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        });

        // Cancelar reserva (Simulando UserId por Header para pruebas)
        group.MapPatch("/{id}/cancel", async (Guid id, [FromHeader(Name = "X-User-Id")] Guid userId, IReservationService service) =>
        {
            try
            {
                await service.CancelReservationAsync(id, userId);
                return Results.NoContent();
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        });

        // Completar reserva (Acción automática o de sistema)
        group.MapPatch("/{id}/complete", async (Guid id, IReservationService service) =>
        {
            try
            {
                await service.CompleteReservationAsync(id);
                return Results.NoContent();
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        });
    }
}