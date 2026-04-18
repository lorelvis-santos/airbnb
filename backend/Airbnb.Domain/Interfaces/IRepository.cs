namespace Airbnb.Domain.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task AddAsync(T item);
    Task UpdateAsync(T item);
    Task DeleteAsync(T item);
}