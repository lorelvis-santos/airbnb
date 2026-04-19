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
        string? location, 
        DateTime startDate, 
        DateTime endDate, 
        int? capacity)
    {
        // 1. Iniciamos la consulta base
        var query = _dbSet.AsQueryable();

        // 2. Filtros dinámicos (solo se aplican si el usuario envió el parámetro)
        if (!string.IsNullOrWhiteSpace(location))
        {
            query = query.Where(p => p.Location.Contains(location));
        }

        if (capacity.HasValue)
        {
            query = query.Where(p => p.Capacity >= capacity.Value);
        }

        // 3. LA MAGIA: Filtro estricto de disponibilidad usando LINQ
        // Verificamos que NO exista ninguna reserva confirmada ni bloqueo que se solape
        // Fórmula de solapamiento: (InicioA < FinB) && (FinA > InicioB)
        query = query.Where(p =>
            
            // Regla A: Sin reservas confirmadas en esas fechas
            !p.Reservations.Any(r => 
                r.Status == ReservationStatus.Confirmed && 
                r.CheckIn < endDate && 
                r.CheckOut > startDate) 
            
            && // AND
            
            // Regla B: Sin fechas bloqueadas por el host en ese rango
            !p.Blocks.Any(b => 
                b.StartDate < endDate && 
                b.EndDate > startDate)
        );

        return await query.ToListAsync();
    }
}