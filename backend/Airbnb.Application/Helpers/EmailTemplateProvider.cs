namespace Airbnb.Application.Helpers;

public static class EmailTemplateProvider
{
    public static string GetConfirmationEmail(string userName, string confirmationLink)
    {
        return $@"
        <!DOCTYPE html>
        <html lang='es'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Confirmación de Cuenta</title>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 40px 0; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }}
                .header {{ background-color: #2563eb; color: #ffffff; padding: 30px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 24px; }}
                .content {{ padding: 40px 30px; color: #374151; line-height: 1.6; }}
                .content h2 {{ color: #111827; margin-top: 0; }}
                .button-container {{ text-align: center; margin: 30px 0; }}
                .button {{ background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; }}
                .button:hover {{ background-color: #1d4ed8; }}
                .footer {{ background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }}
                .fallback-link {{ word-break: break-all; color: #2563eb; font-size: 13px; }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Bienvenido a la Plataforma</h1>
                </div>
                <div class='content'>
                    <h2>¡Hola, {userName}!</h2>
                    <p>Gracias por registrarte. Para completar tu registro y poder iniciar sesión, necesitamos que confirmes tu dirección de correo electrónico. Este enlace es válido por 120 minutos.</p>
                    
                    <div class='button-container'>
                        <a href='{confirmationLink}' class='button'>Confirmar mi cuenta</a>
                    </div>
                    
                    <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
                    <p class='fallback-link'>{confirmationLink}</p>
                </div>
                <div class='footer'>
                    <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                </div>
            </div>
        </body>
        </html>";
    }

    public static string GetReservationStatusEmail(string userName, string propertyTitle, string status)
    {
        var color = status == "Confirmada" ? "#10b981" : "#ef4444";
        return $@"
        <div style='font-family: sans-serif; padding: 20px;'>
            <h2 style='color: {color};'>Tu reserva ha sido {status}</h2>
            <p>Hola {userName},</p>
            <p>Te notificamos que el estado de tu viaje a <b>{propertyTitle}</b> ahora es: <b>{status}</b>.</p>
        </div>";
    }
}