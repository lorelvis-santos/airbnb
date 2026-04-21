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

    public static string GetHostNewReservationEmail(string hostName, string guestName, string propertyTitle, DateTime checkIn, DateTime checkOut)
    {
        return $@"
        <div style='font-family: sans-serif; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px;'>
            <h2 style='color: #2563eb;'>¡Tienes una nueva reserva!</h2>
            <p>Hola <b>{hostName}</b>,</p>
            <p>Buenas noticias: <b>{guestName}</b> ha reservado tu propiedad <b>{propertyTitle}</b>.</p>
            <div style='background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                <p style='margin: 5px 0;'><b>Llegada:</b> {checkIn:dd/MM/yyyy}</p>
                <p style='margin: 5px 0;'><b>Salida:</b> {checkOut:dd/MM/yyyy}</p>
            </div>
            <p>Puedes gestionar esta reserva desde tu panel de anfitrión.</p>
        </div>";
    }

    // Plantilla específica para el Huésped (Confirmación)
    public static string GetGuestConfirmationEmail(string guestName, string propertyTitle, DateTime checkIn, DateTime checkOut)
    {
        return $@"
        <div style='font-family: sans-serif; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px;'>
            <h2 style='color: #10b981;'>¡Tu viaje está confirmado!</h2>
            <p>Hola <b>{guestName}</b>,</p>
            <p>Todo listo para tu estancia en <b>{propertyTitle}</b>.</p>
            <div style='background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                <p style='margin: 5px 0;'><b>Check-in:</b> {checkIn:dd/MM/yyyy}</p>
                <p style='margin: 5px 0;'><b>Check-out:</b> {checkOut:dd/MM/yyyy}</p>
            </div>
            <p>¡Esperamos que disfrutes tu viaje!</p>
        </div>";
    }

    // Nueva plantilla para el Anfitrión ante un cambio de estado
    public static string GetHostStatusEmail(string hostName, string propertyTitle, string status)
    {
        var color = status is "Confirmada" or "Completada" ? "#10b981" : "#ef4444";
        return $@"
        <div style='font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;'>
            <h2 style='color: {color};'>Actualización de reserva</h2>
            <p>Hola <b>{hostName}</b>,</p>
            <p>Te notificamos que la reserva en tu alojamiento <b>{propertyTitle}</b> ha cambiado su estado a: <b style='color: {color};'>{status}</b>.</p>
        </div>";
    }

    // Nueva plantilla para el Huésped ante un cambio de estado
    public static string GetGuestStatusEmail(string guestName, string propertyTitle, string status)
    {
        var color = status is "Confirmada" or "Completada" ? "#10b981" : "#ef4444";
        return $@"
        <div style='font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;'>
            <h2 style='color: {color};'>Actualización de tu viaje</h2>
            <p>Hola <b>{guestName}</b>,</p>
            <p>Te notificamos que el estado de tu viaje a <b>{propertyTitle}</b> ahora es: <b style='color: {color};'>{status}</b>.</p>
        </div>";
    }
}