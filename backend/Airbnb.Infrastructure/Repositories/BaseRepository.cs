using System.Linq.Expressions;
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

    public IQueryable<T> GetQueryable()
    {
        return _context.Set<T>().AsQueryable();
    }

    public async Task<(List<TDto> Items, int TotalCount)> GetPagedProjectedAsync<TDto>(
        IQueryable<T> query, 
        Expression<Func<T, TDto>> projection, 
        int pageNumber, 
        int pageSize)
    {
        // 1. EF Core cuenta los registros totales
        var totalCount = await query.CountAsync();

        // 2. EF Core proyecta (Select), Pagina (Skip/Take) y ejecuta asíncronamente
        var items = await query
            .Select(projection)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}