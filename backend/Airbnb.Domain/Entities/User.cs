using Airbnb.Domain.Enum;

namespace Airbnb.Domain.Entities;

public class User {
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool IsConfirmed { get; set; } = false;
    public string? Token { get; set; }
    public DateTime TokenExpiration { get; set; }
    public ICollection<UserRole> Roles { get; set; } = new List<UserRole>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}