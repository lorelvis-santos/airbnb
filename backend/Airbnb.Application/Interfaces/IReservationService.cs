using Airbnb.Application.Dtos.Reservation;
using Airbnb.Domain.Entities;

namespace Airbnb.Application.Interfaces;

public interface IReservationService
{
    Task<ReservationResponseDto> CreateReservationAsync(CreateReservationDto dto);
    Task CancelReservationAsync(Guid reservationId, Guid userId);
    Task CompleteReservationAsync(Guid reservationId);
}