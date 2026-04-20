using System.Linq.Expressions;

namespace Airbnb.Domain.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task AddAsync(T item);
    Task UpdateAsync(T item);
    Task DeleteAsync(T item);
    IQueryable<T> GetQueryable();
    Task<(List<TDto> Items, int TotalCount)> GetPagedProjectedAsync<TDto>(
        IQueryable<T> query,
        Expression<Func<T, TDto>> projection,
        int pageNumber,
        int pageSize);
}