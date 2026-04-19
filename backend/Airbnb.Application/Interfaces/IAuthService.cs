using Airbnb.Application.Dtos.Auth;

namespace Airbnb.Application.Interfaces;

public interface IAuthService
{
    Task RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task ConfirmAccountAsync(string token);
}