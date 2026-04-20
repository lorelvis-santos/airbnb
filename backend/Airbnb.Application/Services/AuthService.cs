using Airbnb.Application.Dtos.Auth;
using Airbnb.Application.Interfaces;
using Airbnb.Domain.Entities;
using Airbnb.Domain.Enum;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Airbnb.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenProvider _tokenProvider;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenProvider tokenProvider,
        IEmailService emailService,
        IConfiguration configuration
    ) 
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenProvider = tokenProvider;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task RegisterAsync(RegisterDto dto)
    {
        var existingUser = await _userRepository.GetUserByEmailAsync(dto.Email);

        if (existingUser != null)
        {
            throw new AppException(ErrorType.Conflict, "El correo electrónico ya está registrado.");
        }

        if (dto.Password.Trim().Length < 8)
        {
            throw new AppException(ErrorType.Validation, "La contraseña debe de tener minimo 8 carácteres");
        }

        // Generamos un token único para la confirmación de correo
        var confirmationToken = Guid.NewGuid().ToString();

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = dto.FullName,
            Email = dto.Email,
            Password = _passwordHasher.Hash(dto.Password),
            Roles = [UserRole.Guest],
            IsConfirmed = false,
            Token = confirmationToken,
            TokenExpiration = DateTime.UtcNow.AddMinutes(120)
        };

        await _userRepository.AddAsync(user);

        // 1. Obtenemos la URL base del frontend desde appsettings.json (con fallback local)
        var frontendUrl = _configuration["FrontendSettings:BaseUrl"] ?? "http://localhost:5173";
        
        // 2. Construimos el enlace codificando solo el token
        var confirmLink = $"{frontendUrl}/confirm?token={Uri.EscapeDataString(confirmationToken)}";

        // 3. Generamos la plantilla HTML elegante
        string subject = "Confirma tu cuenta en Airbnb Clone";
        string htmlBody = GenerateConfirmationEmailHtml(user.FullName, confirmLink);
        
        // 4. Enviamos el correo con HTML
        await _emailService.SendEmailAsync(user.Email, subject, htmlBody);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _userRepository.GetUserByEmailAsync(dto.Email);

        if (dto.Password.Trim().Length < 8)
        {
            throw new AppException(ErrorType.Validation, "La contraseña debe de tener minimo 8 carácteres");
        }
        
        if (user == null || !_passwordHasher.Verify(dto.Password, user.Password))
        {
            throw new AppException(ErrorType.Unauthorized, "Credenciales inválidas.");
        }

        // Regla: Un usuario no confirmado no puede iniciar sesión 
        if (!user.IsConfirmed)
        {
            throw new AppException(ErrorType.Unauthorized, "Debe confirmar su cuenta de correo antes de iniciar sesión.");
        }

        var token = _tokenProvider.GenerateToken(user);

        return new AuthResponseDto
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Token = token,
            Roles = user.Roles.Select(r => r.ToString())
        };
    }

    public async Task ConfirmAccountAsync(string token)
    {
        var user = await _userRepository.GetUserByTokenAsync(token);

        if (user == null)
        {
            throw new AppException(ErrorType.NotFound, "Token de confirmación inválido o no encontrado.");
        }

        // Verificamos que no haya expirado
        if (user.TokenExpiration < DateTime.UtcNow)
        {
            throw new AppException(ErrorType.Validation, "El token de confirmación ha expirado.");
        }

        // Eliminamos el token y confirmamos el usuario
        user.IsConfirmed = true;
        user.Token = null;
        
        await _userRepository.UpdateAsync(user);
    }

    // Método privado para generar el HTML
    // Método privado para generar el HTML
    private string GenerateConfirmationEmailHtml(string userName, string confirmationLink)
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
}