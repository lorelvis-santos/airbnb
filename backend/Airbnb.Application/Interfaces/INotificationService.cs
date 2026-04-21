namespace Airbnb.Application.Interfaces;

public interface INotificationService
{
    Task SendNewReservationNotificationsAsync(Guid hostId, Guid guestId, string propertyTitle, DateTime checkIn, DateTime checkOut);
    Task SendStatusUpdateNotificationsAsync(Guid hostId, Guid guestId, string propertyTitle, string status);
}