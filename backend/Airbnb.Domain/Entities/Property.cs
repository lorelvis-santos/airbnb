namespace Airbnb.Domain.Entities;

public class Property
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; } 
    public int Capacity { get; set; }
    public Guid HostId { get; set; }
    public User? Host { get; set; } = null;
    public ICollection<PropertyBlock> Blocks { get; set; } = new List<PropertyBlock>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}