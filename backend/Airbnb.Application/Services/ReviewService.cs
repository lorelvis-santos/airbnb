// Airbnb.Application/Services/ReviewService.cs
using Airbnb.Application.Dtos.Review;
using Airbnb.Application.Interfaces;
using Airbnb.Domain.Entities;
using Airbnb.Domain.Enum;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;

namespace Airbnb.Application.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IReservationRepository _reservationRepository;
    private readonly IPropertyRepository _propertyRepository;

    public ReviewService(
        IReviewRepository reviewRepository,
        IReservationRepository reservationRepository,
        IPropertyRepository propertyRepository)
    {
        _reviewRepository = reviewRepository;
        _reservationRepository = reservationRepository;
        _propertyRepository = propertyRepository;
    }

    public async Task<Review> CreateReviewAsync(Guid reservationId, Guid guestId, CreateReviewDto dto)
    {
        // 1. Validaciones básicas de entrada
        if (dto.Rating < 1 || dto.Rating > 5)
        {
            throw new AppException(ErrorType.Validation, "La calificación debe estar entre 1 y 5.");
        }

        // 2. Buscar la reserva
        var reservation = await _reservationRepository.GetByIdAsync(reservationId);
        if (reservation == null)
        {
            throw new AppException(ErrorType.NotFound, "Reserva no encontrada.");
        }

        // 3. Validar identidad (Solo el huésped de ESA reserva puede opinar)
        if (reservation.GuestId != guestId)
        {
            throw new AppException(ErrorType.Unauthorized, "No tienes permiso para dejar una reseña en esta reserva.");
        }

        // 4. Regla de negocio estricta: Solo reservas completadas
        if (reservation.Status != ReservationStatus.Completed)
        {
            throw new AppException(ErrorType.Conflict, "Solo puedes dejar una reseña si la reserva ha sido completada.");
        }

        // 5. Validar que no haya comentado ya (Relación 1 a 1)
        var hasReview = await _reviewRepository.HasReviewForReservationAsync(reservationId);
        if (hasReview)
        {
            throw new AppException(ErrorType.Conflict, "Ya has dejado una reseña para esta reserva.");
        }

        // 6. Guardar la reseña
        var review = new Review
        {
            Id = Guid.NewGuid(),
            ReservationId = reservationId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            PropertyId = reservation.PropertyId,
            GuestId = guestId,
        };

        await _reviewRepository.AddAsync(review);
        return review;
    }

    public async Task<object> GetPropertyRatingStatsAsync(Guid propertyId)
    {
        var property = await _propertyRepository.GetByIdAsync(propertyId);
        
        if (property == null)
        {
            throw new AppException(ErrorType.NotFound, "Propiedad no encontrada.");
        }

        // Ejecutamos ambas consultas
        var average = await _reviewRepository.GetAverageRatingOfPropertyAsync(propertyId);
        var count = await _reviewRepository.GetReviewsCountOfPropertyAsync(propertyId);

        return new 
        { 
            averageRating = average, 
            reviewsCount = count 
        };
    }
}