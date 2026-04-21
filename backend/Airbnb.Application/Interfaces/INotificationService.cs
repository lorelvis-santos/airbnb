namespace Airbnb.Application.Interfaces;

public interface INotificationService
{
    Task SendNotificationAsync(Guid userId, string message, string propertyTitle, string status);
}