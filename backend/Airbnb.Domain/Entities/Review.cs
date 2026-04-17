using Airbnb.Domain.Enum;

namespace Airbnb.Domain.Entities;

public class Review
{
    public Guid Id { get; set; }
    public Guid ReservationId { get; set; }
    public int Rating { get; set; } // 1 - 5
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Reservation? Reservation { get; set; } = null;
}