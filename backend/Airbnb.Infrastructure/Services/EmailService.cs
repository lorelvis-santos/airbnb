using System.Net.Mail;
using Airbnb.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Airbnb.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly IConfiguration _configuration;

    public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public void SendEmailInBackground(string to, string subject, string body)
    {
        _ = Task.Run(async () =>
        {
            try
            {
                var host = _configuration["SmtpSettings:Host"] ?? "localhost";
                var port = int.Parse(_configuration["SmtpSettings:Port"] ?? "1025");
                var senderEmail = _configuration["SmtpSettings:SenderEmail"] ?? "noreply@sistema.local";
                var senderName = _configuration["SmtpSettings:SenderName"] ?? "Sistema";

                using var client = new SmtpClient(host, port);
                
                var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail, senderName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true,
                };
                
                mailMessage.To.Add(to);

                // Se envía a través de tu SMTP real sin hacer esperar al usuario
                await client.SendMailAsync(mailMessage);

                _logger.LogInformation("Correo enviado exitosamente a {To} vía SMTP", to);
            }
            catch (Exception ex)
            {
                // Si el SMTP falla (ej. contraseña incorrecta), no tumba la reserva.
                _logger.LogError(ex, "Error crítico al enviar correo a {To}", to);
            }
        });
    }
}