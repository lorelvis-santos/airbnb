// Airbnb.Application/Services/NotificationService.cs
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

    public async Task SendNotificationAsync(Guid userId, string message)
    {
        // Guardamos la notificación en la base de datos
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Message = message,
            CreatedAt = DateTime.UtcNow
        };

        await _notificationRepo.AddAsync(notification);

        // Buscamos el correo del usuario para enviarle el email
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user != null)
        {
            // Disparamos el correo en segundo plano
            await _emailService.SendEmailAsync(
                to: user.Email,
                subject: "Actualización de tu reserva en Airbnb",
                body: message
            );
        }
    }
}