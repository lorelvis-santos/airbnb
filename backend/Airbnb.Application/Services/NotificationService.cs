// Airbnb.Application/Services/NotificationService.cs
using Airbnb.Application.Helpers;
using Airbnb.Application.Interfaces;
using Airbnb.Domain.Entities;
using Airbnb.Domain.Interfaces;

namespace Airbnb.Application.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepo;
    private readonly IEmailService _emailService;
    private readonly IUserRepository _userRepository;

    public NotificationService(
        INotificationRepository notificationRepo,
        IEmailService emailService,
        IUserRepository userRepository)
    {
        _notificationRepo = notificationRepo;
        _emailService = emailService;
        _userRepository = userRepository;
    }

    public async Task SendNotificationAsync(Guid userId, string message, string propertyTitle, string status)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Message = message,
            CreatedAt = DateTime.UtcNow
        };

        await _notificationRepo.AddAsync(notification);

        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user != null)
        {
            string htmlBody = EmailTemplateProvider.GetReservationStatusEmail(user.FullName, propertyTitle, status);

            _emailService.SendEmailInBackground(
                to: user.Email,
                subject: $"Actualización de tu reserva: {status}",
                body: htmlBody
            );
        }
    }}