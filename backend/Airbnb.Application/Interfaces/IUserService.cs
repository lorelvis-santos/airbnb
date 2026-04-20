using Airbnb.Application.Dtos.User;

namespace Airbnb.Application.Interfaces;

public interface IUserService
{
    Task<UserResponseDto> GetUserByIdAsync(Guid id);
    Task BecomeHostAsync(Guid userId);
}