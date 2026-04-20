using Airbnb.Domain.Enum;

namespace Airbnb.Application.Dtos.User;

public class UserResponseDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<UserRole> Roles { get; set; } = [];
}