using Airbnb.Application.Dtos.Auth;
using Airbnb.Application.Interfaces;
using Airbnb.Domain.Entities;
using Airbnb.Domain.Enum;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;

namespace Airbnb.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenProvider _tokenProvider;
    private readonly IEmailService _emailService;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenProvider tokenProvider,
        IEmailService emailService
    ) 
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenProvider = tokenProvider;
        _emailService = emailService;
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

        // Llamada real al servicio de correo electrónico en segundo plano

        // TODO: Refinar el correo, para que sea mas completo o trabajar mediante confirmacion por codigo.
        string subject = "Confirma tu cuenta en la plataforma";
        string body = $"Hola {user.FullName},\n\nGracias por registrarte. Para completar tu registro y poder iniciar sesión, por favor confirma tu cuenta utilizando el siguiente token:\n\n{confirmationToken}\n\nEste token expirará en 120 minutos.";
        
        await _emailService.SendEmailAsync(user.Email, subject, body);
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
}