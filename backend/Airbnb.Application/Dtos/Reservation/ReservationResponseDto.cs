namespace Airbnb.Application.Dtos.Reservation;

public class ReservationResponseDto
{
    public Guid Id { get; set; }
    public Guid PropertyId { get; set; }
    public string PropertyTitle { get; set; } = string.Empty;
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}