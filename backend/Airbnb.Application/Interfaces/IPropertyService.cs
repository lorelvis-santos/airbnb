using Airbnb.Application.Dtos.Property;
using Airbnb.Domain.Entities;

namespace Airbnb.Application.Interfaces;

public interface IPropertyService
{
    Task<IEnumerable<PropertyResponseDto>> GetAllPropertiesAsync();
    Task<PropertyDetailDto> GetPropertyByIdAsync(Guid id);
    Task<Property> CreatePropertyAsync(CreatePropertyDto dto, Guid hostId);
    Task<Property> UpdatePropertyAsync(Guid propertyId, UpdatePropertyDto dto, Guid hostId);
    Task DeletePropertyAsync(Guid propertyId, Guid hostId);
    Task<IEnumerable<Property>> GetPropertiesByHostAsync(Guid hostId);
    Task<List<string>> UploadPropertyImagesAsync(Guid propertyId, Guid hostId, List<(Stream Content, string Extension)> files);
    Task DeletePropertyImageAsync(Guid propertyId, Guid imageId, Guid hostId);

    Task<IEnumerable<PropertyResponseDto>> SearchAvailablePropertiesAsync(
        string? city, 
        string? province, 
        DateTime startDate, 
        DateTime endDate, 
        int? capacity);

    Task<PropertyBlock> BlockPropertyDatesAsync(Guid propertyId, Guid hostId, CreatePropertyBlockDto dto);
    Task DeletePropertyBlockAsync(Guid propertyId, Guid blockId, Guid hostId);
}