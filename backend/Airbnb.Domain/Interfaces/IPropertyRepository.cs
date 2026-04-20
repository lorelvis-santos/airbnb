using Airbnb.Domain.Entities;

namespace Airbnb.Domain.Interfaces;

public interface IPropertyRepository : IRepository<Property>
{
    Task<IEnumerable<Property>> GetAllPropertiesWithDetailsAsync();

    Task<Property?> GetByIdWithDetailsAsync(Guid id);

    Task<IEnumerable<Property>> SearchAvailablePropertiesAsync(
        string? city, 
        string? province, 
        DateTime startDate, 
        DateTime endDate, 
        int? capacity
    );

    Task<IEnumerable<Property>> GetPropertiesByHostAsync(Guid hostId);
}