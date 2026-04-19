// Airbnb.Application/Interfaces/IReviewService.cs
using Airbnb.Application.Dtos.Review;
using Airbnb.Domain.Entities;

namespace Airbnb.Application.Interfaces;

public interface IReviewService
{
    Task<Review> CreateReviewAsync(Guid reservationId, Guid guestId, CreateReviewDto dto);
    Task<object> GetPropertyRatingStatsAsync(Guid propertyId);
}