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

    public async Task<bool> SendEmailAsync(string to, string subject, string body)
    {
        try
        {
            // Extracción de variables de configuración con valores por defecto de seguridad
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
                IsBodyHtml = true, // Establecido en true para soportar plantillas HTML en el futuro
            };
            
            mailMessage.To.Add(to);

            // Se ejecuta la tarea de forma asíncrona real
            await client.SendMailAsync(mailMessage);

            _logger.LogInformation("Correo enviado exitosamente a {To} vía SMTP", to);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error crítico al enviar correo a {To}", to);
            return false;
        }
    }
}