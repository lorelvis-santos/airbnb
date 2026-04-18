using Airbnb.Domain.Entities;

namespace Airbnb.Domain.Interfaces;

public interface IReservationRepository : IRepository<Reservation>
{
    Task<IEnumerable<Reservation>> GetReservationsByGuestAsync(Guid guestId);
    Task<IEnumerable<Reservation>> GetReservationsByPropertyAsync(Guid propertyId);
    Task<bool> HasOverlappingReservationAsync(Guid propertyId, DateTime checkIn, DateTime checkOut);
}