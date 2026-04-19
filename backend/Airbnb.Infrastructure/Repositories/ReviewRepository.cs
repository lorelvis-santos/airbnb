using Airbnb.Domain.Entities;
using Airbnb.Domain.Interfaces;
using Airbnb.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Airbnb.Infrastructure.Repositories;

public class ReviewRepository : Repository<Review>, IReviewRepository
{
    public ReviewRepository(AirbnbDbContext context) : base(context)
    {
    }

    public async Task<decimal> GetAverageRatingOfPropertyAsync(Guid propertyId)
    {
        var average = await _dbSet
            .Include(r => r.Reservation)
            .Where(r => r.Reservation!.PropertyId == propertyId)
            .AverageAsync(r => (decimal?)r.Rating);

        // Si no hay reseñas, devuelve 0
        return average ?? 0m;
    }

    public async Task<bool> HasReviewForReservationAsync(Guid reservationId)
    {
        return await _dbSet.AnyAsync(r => r.ReservationId == reservationId);
    }

    public async Task<int> GetReviewsCountOfPropertyAsync(Guid propertyId)
    {
        return await _dbSet
            .Include(r => r.Reservation)
            .CountAsync(r => r.Reservation!.PropertyId == propertyId);
    }
}