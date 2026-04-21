using Airbnb.Application.Dtos;
using Airbnb.Application.Dtos.Property;
using Airbnb.Domain.Entities;

namespace Airbnb.Application.Interfaces;

public interface IPropertyService
{
    Task<PagedResult<PropertyResponseDto>> GetAllPropertiesAsync(int pageNumber = 1, int pageSize = 12);
    Task<PropertyDetailDto> GetPropertyByIdAsync(Guid id);
    Task<Property> CreatePropertyAsync(CreatePropertyDto dto, Guid hostId);
    Task<Property> UpdatePropertyAsync(Guid propertyId, UpdatePropertyDto dto, Guid hostId);
    Task DeletePropertyAsync(Guid propertyId, Guid hostId);
    Task<PagedResult<PropertyResponseDto>> GetPropertiesByHostAsync(Guid hostId, int pageNumber = 1, int pageSize = 12);
    Task<List<string>> UploadPropertyImagesAsync(Guid propertyId, Guid hostId, List<(Stream Content, string Extension)> files);
    Task DeletePropertyImageAsync(Guid propertyId, Guid imageId, Guid hostId);
    Task<PagedResult<PropertyResponseDto>> SearchAvailablePropertiesAsync(
        string? city, 
        string? province, 
        DateTime startDate, 
        DateTime endDate, 
        int? capacity,
        decimal? minPrice,
        decimal? maxPrice,
        int pageNumber = 1, 
        int pageSize = 12
    );

    Task<PropertyBlock> BlockPropertyDatesAsync(Guid propertyId, Guid hostId, CreatePropertyBlockDto dto);
    Task DeletePropertyBlockAsync(Guid propertyId, Guid blockId, Guid hostId);
}