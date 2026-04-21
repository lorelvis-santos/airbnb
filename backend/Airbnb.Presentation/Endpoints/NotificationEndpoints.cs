// Airbnb.Presentation/Endpoints/NotificationEndpoints.cs
using System.Security.Claims;
using Airbnb.Application.Interfaces;
using Airbnb.Domain.Enum;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;
using Airbnb.Presentation.Extensions;
using Airbnb.Presentation.Models;
using Microsoft.AspNetCore.Mvc;

namespace Airbnb.Presentation.Endpoints;

public static class NotificationEndpoints
{
    public static void MapNotificationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/notifications").WithTags("Notifications").RequireAuthorization();

        // 1. Obtener notificaciones (soporta filtro ?unreadOnly=true)
        group.MapGet("/", async (
            [FromQuery] bool unreadOnly, 
            ClaimsPrincipal user, 
            INotificationRepository repository) =>
        {
            var userId = user.GetUserId();
            
            var notifications = unreadOnly 
                ? await repository.GetUnreadNotificationsByUserIdAsync(userId)
                : await repository.GetNotificationsByUserIdAsync(userId);

            return Results.Ok(ApiResponse<object>.Success(notifications));
        });

        // 2. Obtener solo el contador de "No leídas" (ideal para la campanita del menú)
        group.MapGet("/unread-count", async (ClaimsPrincipal user, INotificationRepository repository) =>
        {
            var userId = user.GetUserId();
            var count = await repository.GetUnreadCountByUserIdAsync(userId);
            
            return Results.Ok(ApiResponse<object>.Success(new { unreadCount = count }));
        });

        // 3. Marcar como leída
        group.MapPatch("/{id}/read", async (Guid id, ClaimsPrincipal user, INotificationRepository repository) =>
        {
            var userId = user.GetUserId();
            var notification = await repository.GetByIdAsync(id);

            if (notification == null)
            {
                throw new AppException(ErrorType.NotFound, "Notificación no encontrada.");
            }

            // Seguridad: Solo el dueño de la notificación puede marcarla como leída
            if (notification.UserId != userId)
            {
                throw new AppException(ErrorType.Unauthorized, "No tienes permiso para modificar esta notificación.");
            }

            notification.Status = NotificationStatus.Read;
            await repository.UpdateAsync(notification);

            return Results.Ok(ApiResponse<object>.Success(new { message = "Notificación marcada como leída." }));
        });

        group.MapPatch("/mark-all-read", async (ClaimsPrincipal user, INotificationRepository repository) =>
        {
            var userId = user.GetUserId();

            await repository.MarkAllAsReadByUserIdAsync(userId);

            return Results.Ok(ApiResponse<object>.Success(new { message = "Todas las notificaciones han sido marcadas como leídas." }));
        });
    }
}