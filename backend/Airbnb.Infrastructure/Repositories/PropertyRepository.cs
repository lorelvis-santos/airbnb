// Airbnb.Infrastructure/Repositories/PropertyRepository.cs
using Airbnb.Domain.Entities;
using Airbnb.Domain.Enum;
using Airbnb.Domain.Interfaces;
using Airbnb.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Airbnb.Infrastructure.Repositories;

public class PropertyRepository : Repository<Property>, IPropertyRepository
{
    public PropertyRepository(AirbnbDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Property>> GetPropertiesByHostAsync(Guid hostId)
    {
        return await _dbSet
            .Where(p => p.HostId == hostId)
            .OrderByDescending(p => p.Id) // Opcional: ordenar por creación
            .ToListAsync();
    }

    public async Task<IEnumerable<Property>> SearchAvailablePropertiesAsync(
        string? city,
        string? province,
        DateTime startDate,
        DateTime endDate,
        int? capacity
    )
    {
        var query = _dbSet.AsQueryable();

        if (!string.IsNullOrWhiteSpace(city))
        {
            query = query.Where(p => p.City.Contains(city));
        }

        if (!string.IsNullOrWhiteSpace(province))
        {
            query = query.Where(p => p.Province.Contains(province));
        }

        if (capacity.HasValue)
        {
            query = query.Where(p => p.Capacity >= capacity.Value);
        }

        query = query.Where(p =>
            !p.Reservations.Any(r => r.Status == ReservationStatus.Confirmed && r.CheckIn < endDate && r.CheckOut > startDate) &&
            !p.Blocks.Any(b => b.StartDate < endDate && b.EndDate > startDate)
        );

        return await query.ToListAsync();
    }
}