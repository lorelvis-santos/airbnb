using Airbnb.Domain.Enum;

namespace Airbnb.Domain.Entities;

public class Notification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Message { get; set; } = string.Empty;
    public NotificationStatus Status { get; set; } = NotificationStatus.Unread;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}