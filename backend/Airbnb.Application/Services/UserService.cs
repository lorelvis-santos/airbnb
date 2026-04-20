// Airbnb.Application/Services/UserService.cs
using Airbnb.Application.Dtos.User;
using Airbnb.Application.Interfaces;
using Airbnb.Domain.Enum;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;

namespace Airbnb.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserResponseDto> GetUserByIdAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);

        if (user == null)
        {
            throw new AppException(ErrorType.NotFound, "Usuario no encontrado.");
        }

        return new UserResponseDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Roles = [.. user.Roles.Select(r => r)]
        };
    }

    public async Task BecomeHostAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user == null)
        {
            throw new AppException(ErrorType.NotFound, "Usuario no encontrado.");
        }

        // Validamos que no sea anfitrión ya
        if (user.Roles.Contains(UserRole.Host))
        {
            throw new AppException(ErrorType.Conflict, "El usuario ya es un anfitrión.");
        }

        // Le otorgamos el nuevo poder
        user.Roles.Add(UserRole.Host);
        
        await _userRepository.UpdateAsync(user);
    }
}