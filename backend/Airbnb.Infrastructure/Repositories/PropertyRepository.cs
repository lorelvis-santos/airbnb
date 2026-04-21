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

    public async Task<IEnumerable<Property>> GetAllPropertiesWithDetailsAsync()
    {
        return await _dbSet
            .Include(p => p.Images)
            .Include(p => p.Host)
            .Include(p => p.Reviews) // Agregado por seguridad
            .ToListAsync();
    }

    public async Task<Property?> GetByIdWithDetailsAsync(Guid id)
    {
        return await _dbSet
            .Include(p => p.Images)
            .Include(p => p.Host)
            .Include(p => p.Blocks)
            .Include(p => p.Reservations)
            .Include(p => p.Reviews)
                .ThenInclude(r => r.Guest)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<Property>> GetPropertiesByHostAsync(Guid hostId)
    {
        return await _dbSet
            .Include(p => p.Images)
            .Include(p => p.Host)
            .Include(p => p.Blocks)
            .Include(p => p.Reservations)
            .Include(p => p.Reviews)
            .Where(p => p.HostId == hostId)
            .OrderByDescending(p => p.Id) 
            .ToListAsync();
    }

    public async Task<IEnumerable<Property>> SearchAvailablePropertiesAsync(
        string? city,
        string? province,
        DateTime? startDate, // Cambiado a nullable
        DateTime? endDate,   // Cambiado a nullable
        int? capacity,
        decimal? minPrice,
        decimal? maxPrice
    )
    {
        var query = _dbSet
            .Include(p => p.Images)
            .Include(p => p.Host)
            .Include(p => p.Reviews)
            .AsQueryable();

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

        if (minPrice.HasValue)
        {
            query = query.Where(p => p.PricePerNight >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(p => p.PricePerNight <= maxPrice.Value);
        }

        // El filtro de fechas se ejecuta únicamente si se proporcionan ambas
        if (startDate.HasValue && endDate.HasValue)
        {
            var start = startDate.Value;
            var end = endDate.Value;

            query = query.Where(p =>
                !p.Reservations.Any(r => r.Status == ReservationStatus.Confirmed && r.CheckIn < end && r.CheckOut > start) &&
                !p.Blocks.Any(b => b.StartDate < end && b.EndDate > start)
            );
        }

        return await query.ToListAsync();
    }
}