namespace Airbnb.Application.Dtos.Property;

public class PropertyResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; }
    
    public HostSimpleDto? Host { get; set; } = null;
    public List<string> Images { get; set; } = [];
}

public class HostSimpleDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
}