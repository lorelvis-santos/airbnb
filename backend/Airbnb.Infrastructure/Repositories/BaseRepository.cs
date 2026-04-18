using Airbnb.Domain.Interfaces;
using Airbnb.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Airbnb.Infrastructure.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly AirbnbDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(AirbnbDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<T?> GetByIdAsync(Guid id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task AddAsync(T item)
    {
        await _dbSet.AddAsync(item);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(T item)
    {
        _dbSet.Update(item);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(T item)
    {
        _dbSet.Remove(item);
        await _context.SaveChangesAsync();
    }
}