// Airbnb.Infrastructure/Repositories/NotificationRepository.cs
using Airbnb.Domain.Entities;
using Airbnb.Domain.Enum;
using Airbnb.Domain.Interfaces;
using Airbnb.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Airbnb.Infrastructure.Repositories;

public class NotificationRepository : Repository<Notification>, INotificationRepository
{
    public NotificationRepository(AirbnbDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Notification>> GetNotificationsByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Notification>> GetUnreadNotificationsByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .Where(n => n.UserId == userId && n.Status == NotificationStatus.Unread)
            .OrderByDescending(n => n.CreatedAt) // Ordenamos para mostrar las más recientes primero
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .CountAsync(n => n.UserId == userId && n.Status == NotificationStatus.Unread);
    }

    public async Task MarkAllAsReadByUserIdAsync(Guid userId)
    {
        await _context.Set<Notification>()
            .Where(n => n.UserId == userId && n.Status == NotificationStatus.Unread)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.Status, NotificationStatus.Read));
    }
}