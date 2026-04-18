// Airbnb.Application/Services/ReservationService.cs
using Airbnb.Application.Dtos;
using Airbnb.Application.Interfaces;
using Airbnb.Domain.Entities;
using Airbnb.Domain.Enum;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;

namespace Airbnb.Application.Services;

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _reservationRepo;
    private readonly IPropertyRepository _propertyRepo;
    private readonly INotificationService _notificationService;

    public ReservationService(
        IReservationRepository reservationRepo,
        IPropertyRepository propertyRepo,
        INotificationService notificationService)
    {
        _reservationRepo = reservationRepo;
        _propertyRepo = propertyRepo;
        _notificationService = notificationService;
    }

    public async Task<Reservation> CreateReservationAsync(CreateReservationDto dto)
    {
        var property = await _propertyRepo.GetByIdAsync(dto.PropertyId);

        if (property == null)
        {
            throw new AppException(ErrorType.NotFound, "Propiedad no encontrada");
        }

        if (property.HostId == dto.GuestId)
        {
            throw new AppException(ErrorType.Conflict, "No puedes reservar tu propia propiedad.");
        }

        bool isOverlapping = await _reservationRepo.HasOverlappingReservationAsync(
            dto.PropertyId, 
            dto.CheckIn,
            dto.CheckOut
        );
            
        if (isOverlapping)
        {
            throw new AppException(ErrorType.Conflict, "La propiedad ya no está disponible en esas fechas."); 
        }

        var reservation = new Reservation
        {
            Id = Guid.NewGuid(),
            PropertyId = dto.PropertyId,
            GuestId = dto.GuestId,
            CheckIn = dto.CheckIn,
            CheckOut = dto.CheckOut,
            Status = ReservationStatus.Confirmed
        };

        await _reservationRepo.AddAsync(reservation);

        await _notificationService.SendNotificationAsync(
            property.HostId, 
            $"Tienes una nueva reserva para '{property.Title}' del {dto.CheckIn:d} al {dto.CheckOut:d}."
        );

        return reservation;
    }

    public async Task CancelReservationAsync(Guid reservationId, Guid userId)
    {
        var reservation = await _reservationRepo.GetByIdAsync(reservationId);

        if (reservation == null)
        {
            throw new AppException(ErrorType.NotFound, "Reserva no encontrada");
        }

        if (reservation.Status != ReservationStatus.Confirmed)
        {
            throw new AppException(ErrorType.Conflict, "Solo las reservas confirmadas pueden ser canceladas.");
        }

        var property = await _propertyRepo.GetByIdAsync(reservation.PropertyId);

        if (reservation.GuestId != userId && property?.HostId != userId)
        {
            throw new AppException(ErrorType.Unauthorized, "No tienes permiso para cancelar esta reserva.");
        }

        reservation.Status = ReservationStatus.Cancelled;
        await _reservationRepo.UpdateAsync(reservation);

        var cancelMessage = $"La reserva para '{property!.Title}' ha sido cancelada.";

        await _notificationService.SendNotificationAsync(property.HostId, cancelMessage);
        await _notificationService.SendNotificationAsync(reservation.GuestId, cancelMessage);
    }

    public async Task CompleteReservationAsync(Guid reservationId)
    {
        var reservation = await _reservationRepo.GetByIdAsync(reservationId);

        if (reservation == null)
        {
            throw new AppException(ErrorType.NotFound, "Reserva no encontrada");
        }

        if (reservation.Status != ReservationStatus.Confirmed)
        {
            throw new AppException(ErrorType.Conflict, "La reserva debe estar confirmada para poder completarse.");
        }
            
        if (reservation.CheckOut > DateTime.UtcNow)
        {
            throw new AppException(ErrorType.Conflict, "La fecha de salida aún no ha pasado.");
        }

        reservation.Status = ReservationStatus.Completed;
        await _reservationRepo.UpdateAsync(reservation);

        await _notificationService.SendNotificationAsync(
            reservation.GuestId, 
            "Esperamos que hayas disfrutado tu estancia. ¡No olvides dejar una reseña!"
        );
    }
}