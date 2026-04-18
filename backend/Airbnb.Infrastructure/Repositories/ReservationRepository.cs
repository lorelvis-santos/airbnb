using Airbnb.Domain.Entities;
using Airbnb.Domain.Enum;
using Airbnb.Domain.Interfaces;
using Airbnb.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Airbnb.Infrastructure.Repositories;

public class ReservationRepository : Repository<Reservation>, IReservationRepository
{
    public ReservationRepository(AirbnbDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Reservation>> GetReservationsByGuestAsync(Guid guestId)
    {
        return await _dbSet
            .Include(r => r.Property)
            .Where(r => r.GuestId == guestId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Reservation>> GetReservationsByPropertyAsync(Guid propertyId)
    {
        return await _dbSet
            .Include(r => r.Guest)
            .Where(r => r.PropertyId == propertyId)
            .OrderByDescending(r => r.CheckIn)
            .ToListAsync();
    }

    public async Task<bool> HasOverlappingReservationAsync(Guid propertyId, DateTime checkIn, DateTime checkOut)
    {
        // Verificamos
        // inicio_a < fin_b o fin_a > inicio_b
        // Asi verificamos si se solapan
        return await _dbSet.AnyAsync(r =>
            r.PropertyId == propertyId &&
            r.Status == ReservationStatus.Confirmed && // Solo verificamos contra reservas confirmadas
            r.CheckIn < checkOut &&
            r.CheckOut > checkIn);
    }
}