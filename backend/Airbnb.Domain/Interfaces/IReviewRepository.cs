using Airbnb.Domain.Entities;

namespace Airbnb.Domain.Interfaces;

public interface IReviewRepository : IRepository<Review>
{
    Task<decimal> GetAverageRatingOfPropertyAsync(Guid propertyId);
    Task<bool> HasReviewForReservationAsync(Guid reservationId);
}