// Airbnb.Application/Services/AuthService.cs
using Airbnb.Application.Dtos;
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

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenProvider tokenProvider)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenProvider = tokenProvider;
    }

    public async Task RegisterAsync(RegisterDto dto)
    {
        var existingUser = await _userRepository.GetUserByEmailAsync(dto.Email);

        if (existingUser != null)
        {
            throw new AppException(ErrorType.Conflict, "El correo electrónico ya está registrado.");
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

        // TODO: Implementar servicio de envio de correos
        Console.WriteLine($"[SIMULACIÓN EMAIL] Para confirmar cuenta, usa el token: {confirmationToken}");
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _userRepository.GetUserByEmailAsync(dto.Email);
        
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