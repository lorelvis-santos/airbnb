using Airbnb.Domain.Entities;
using Airbnb.Domain.Interfaces;
using Airbnb.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Airbnb.Infrastructure.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(AirbnbDbContext context) : base(context) 
    {
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetUserByTokenAsync(string token)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Token == token);
    }
}