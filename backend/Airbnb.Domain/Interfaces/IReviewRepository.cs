using Airbnb.Domain.Entities;

namespace Airbnb.Domain.Interfaces;

public interface IReviewRepository : IRepository<Review>
{
    Task<int> GetReviewsCountOfPropertyAsync(Guid propertyId);
    Task<decimal> GetAverageRatingOfPropertyAsync(Guid propertyId);
    Task<bool> HasReviewForReservationAsync(Guid reservationId);
}