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

    public async Task SendStatusUpdateNotificationsAsync(Guid hostId, Guid guestId, string propertyTitle, string status)
    {
        var host = await _userRepository.GetByIdAsync(hostId);
        var guest = await _userRepository.GetByIdAsync(guestId);

        if (host == null || guest == null) return;

        // 1. Notificación contextual para el ANFITRIÓN
        var hostMessage = $"La reserva en tu alojamiento '{propertyTitle}' ahora se encuentra: {status}.";
        await SaveNotificationInternalAsync(hostId, hostMessage);

        string hostHtml = EmailTemplateProvider.GetHostStatusEmail(host.FullName, propertyTitle, status);
        _emailService.SendEmailInBackground(
            to: host.Email,
            subject: $"Actualización de reserva en {propertyTitle}",
            body: hostHtml
        );

        // 2. Notificación contextual para el HUÉSPED
        var guestMessage = $"Tu viaje a '{propertyTitle}' ahora se encuentra: {status}.";
        await SaveNotificationInternalAsync(guestId, guestMessage);

        string guestHtml = EmailTemplateProvider.GetGuestStatusEmail(guest.FullName, propertyTitle, status);
        _emailService.SendEmailInBackground(
            to: guest.Email,
            subject: $"Actualización de tu viaje: {status}",
            body: guestHtml
        );
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