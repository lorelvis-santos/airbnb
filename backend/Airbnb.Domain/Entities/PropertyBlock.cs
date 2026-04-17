namespace Airbnb.Domain.Entities;

public class PropertyBlock
{
    public Guid Id { get; set; }
    public Guid PropertyId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public Property? Property { get; set; } = null;
}