using Airbnb.Application.Dtos;
using Airbnb.Domain.Entities;

namespace Airbnb.Application.Interfaces;

public interface IReservationService
{
    Task<Reservation> CreateReservationAsync(CreateReservationDto dto);
    Task CancelReservationAsync(Guid reservationId, Guid userId);
    Task CompleteReservationAsync(Guid reservationId);
}