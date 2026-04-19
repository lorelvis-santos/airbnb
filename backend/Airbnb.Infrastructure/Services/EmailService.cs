// Airbnb.Infrastructure/Services/EmailService.cs
using Airbnb.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Airbnb.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public Task<bool> SendEmailAsync(string to, string subject, string body)
    {
        // Simulamos un retraso de red para probar que no bloquea la app
        Task.Run(async () =>
        {
            try
            {
                await Task.Delay(1000); 
                _logger.LogInformation("==========================================");
                _logger.LogInformation("📧 EMAIL ENVIADO A: {To}", to);
                _logger.LogInformation("📧 ASUNTO: {Subject}", subject);
                _logger.LogInformation("📧 MENSAJE: {Body}", body);
                _logger.LogInformation("==========================================");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al enviar el correo a {To}", to);
            }
        });

        return Task.FromResult(true);
    }
}