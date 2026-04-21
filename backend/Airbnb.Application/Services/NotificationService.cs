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

    // Maneja las notificaciones al momento de crear una reserva
    public async Task SendNewReservationNotificationsAsync(Guid hostId, Guid guestId, string propertyTitle, DateTime checkIn, DateTime checkOut)
    {
        var host = await _userRepository.GetByIdAsync(hostId);
        var guest = await _userRepository.GetByIdAsync(guestId);

        if (host == null || guest == null) return;

        // 1. Notificación y Correo para el HOST
        var hostMessage = $"Tienes una nueva reserva para '{propertyTitle}' del {checkIn:d} al {checkOut:d}.";
        await SaveNotificationInternalAsync(hostId, hostMessage);
        
        string hostHtml = EmailTemplateProvider.GetHostNewReservationEmail(host.FullName, guest.FullName, propertyTitle, checkIn, checkOut);
        _emailService.SendEmailInBackground(host.Email, "¡Tienes una nueva reserva!", hostHtml);


        // 2. Notificación y Correo para el GUEST
        var guestMessage = $"¡Tu reserva en '{propertyTitle}' ha sido confirmada del {checkIn:d} al {checkOut:d}!";
        await SaveNotificationInternalAsync(guestId, guestMessage);

        string guestHtml = EmailTemplateProvider.GetGuestConfirmationEmail(guest.FullName, propertyTitle, checkIn, checkOut);
        _emailService.SendEmailInBackground(guest.Email, "Tu viaje está confirmado", guestHtml);
    }

    public async Task SendNotificationAsync(Guid userId, string message, string propertyTitle, string status)
    {
        await SaveNotificationInternalAsync(userId, message);

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
    }

    // --- Helper Privado para no repetir el código de guardar en BD ---
    private async Task SaveNotificationInternalAsync(Guid userId, string message)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Message = message,
            CreatedAt = DateTime.UtcNow
        };
        await _notificationRepo.AddAsync(notification);
    }
}