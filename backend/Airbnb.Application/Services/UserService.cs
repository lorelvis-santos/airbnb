// Airbnb.Application/Services/UserService.cs
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