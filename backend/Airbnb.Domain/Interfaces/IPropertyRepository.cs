using Airbnb.Domain.Entities;

namespace Airbnb.Domain.Interfaces;

public interface IPropertyRepository : IRepository<Property>
{
    Task<IEnumerable<Property>> SearchAvailablePropertiesAsync(
        string? location, 
        DateTime startDate, 
        DateTime endDate, 
        int? capacity
    );

    Task<IEnumerable<Property>> GetPropertiesByHostAsync(Guid hostId);
}