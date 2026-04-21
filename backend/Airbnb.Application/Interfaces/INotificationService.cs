namespace Airbnb.Application.Interfaces;

public interface INotificationService
{
    Task SendNewReservationNotificationsAsync(Guid hostId, Guid guestId, string propertyTitle, DateTime checkIn, DateTime checkOut);
    Task SendNotificationAsync(Guid userId, string message, string propertyTitle, string status);
}