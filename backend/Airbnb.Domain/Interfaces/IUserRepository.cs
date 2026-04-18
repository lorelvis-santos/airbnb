using Airbnb.Domain.Entities;

namespace Airbnb.Domain.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetUserByEmailAsync(string email);
    Task<User?> GetUserByTokenAsync(string token);
}