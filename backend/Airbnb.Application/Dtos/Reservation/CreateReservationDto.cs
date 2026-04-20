namespace Airbnb.Application.Dtos.Reservation;

public class CreateReservationDto
{
    public Guid PropertyId { get; set; }
    public Guid GuestId { get; set; }
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }
}