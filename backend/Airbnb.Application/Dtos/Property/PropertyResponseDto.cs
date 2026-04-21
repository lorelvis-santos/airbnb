namespace Airbnb.Application.Dtos.Property;

public class PropertyResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; }
    public int Capacity { get; set; }
    
    public HostSimpleDto? Host { get; set; } = null;
    public List<PropertyImageDto> Images { get; set; } = [];
    public double AverageRating { get; set; }
    public int ReviewsCount { get; set; }
}

public class HostSimpleDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
}