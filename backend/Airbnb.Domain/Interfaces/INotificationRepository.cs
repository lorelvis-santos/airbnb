using Airbnb.Domain.Entities;

namespace Airbnb.Domain.Interfaces;

public interface INotificationRepository : IRepository<Notification>
{
    // Obtiene todas las notificaciones de un usuario específico, ordenadas por la más reciente
    Task<IEnumerable<Notification>> GetNotificationsByUserIdAsync(Guid userId);

    // Filtra exclusivamente las notificaciones que no han sido leídas por el usuario
    Task<IEnumerable<Notification>> GetUnreadNotificationsByUserIdAsync(Guid userId);

    // Útil para mostrar contadores en la interfaz gráfica (ej. "Tienes 3 notificaciones")
    Task<int> GetUnreadCountByUserIdAsync(Guid userId);
    Task MarkAllAsReadByUserIdAsync(Guid userId);
}