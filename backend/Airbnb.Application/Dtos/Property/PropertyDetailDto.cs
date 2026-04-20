namespace Airbnb.Application.Dtos.Property;

public class PropertyDetailDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; }
    public int Capacity { get; set; }
    public HostSimpleDto? Host { get; set; } = null;
    public List<string> Images { get; set; } = new();
    public List<PropertyBlockDto> Blocks { get; set; } = new();
}

public class PropertyBlockDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}