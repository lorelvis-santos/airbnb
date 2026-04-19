// Airbnb.Application/Services/PropertyService.cs
using Airbnb.Application.Dtos.Property;
using Airbnb.Application.Interfaces;
using Airbnb.Domain.Entities;
using Airbnb.Domain.Enum;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;

namespace Airbnb.Application.Services;

public class PropertyService : IPropertyService
{
    private readonly IPropertyRepository _propertyRepository;

    public PropertyService(IPropertyRepository propertyRepository)
    {
        _propertyRepository = propertyRepository;
    }

    public async Task<Property> CreatePropertyAsync(CreatePropertyDto dto, Guid hostId)
    {
        var property = new Property
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            City = dto.City,
            Province = dto.Province,
            PricePerNight = dto.PricePerNight,
            Capacity = dto.Capacity,
            HostId = hostId // Asignamos al creador automáticamente
        };

        await _propertyRepository.AddAsync(property);
        return property;
    }

    public async Task<Property> UpdatePropertyAsync(Guid propertyId, UpdatePropertyDto dto, Guid hostId)
    {
        var property = await _propertyRepository.GetByIdAsync(propertyId);

        if (property == null)
        {
            throw new AppException(ErrorType.NotFound, "La propiedad no existe.");
        }

        // Regla de negocio estricta: Solo el dueño puede modificar
        if (property.HostId != hostId)
        {
            throw new AppException(ErrorType.Unauthorized, "No tienes permiso para modificar esta propiedad.");
        }

        property.Title = dto.Title;
        property.Description = dto.Description;
        property.City = dto.City;
        property.Province = dto.Province;
        property.PricePerNight = dto.PricePerNight;
        property.Capacity = dto.Capacity;

        await _propertyRepository.UpdateAsync(property);
        return property;
    }

    public async Task DeletePropertyAsync(Guid propertyId, Guid hostId)
    {
        var property = await _propertyRepository.GetByIdAsync(propertyId);

        if (property == null)
        {
            throw new AppException(ErrorType.NotFound, "La propiedad no existe.");
        }

        // Regla de negocio estricta: Solo el dueño puede eliminar
        if (property.HostId != hostId)
        {
            throw new AppException(ErrorType.Unauthorized, "No tienes permiso para eliminar esta propiedad.");
        }

        await _propertyRepository.DeleteAsync(property);
    }

    public async Task<IEnumerable<Property>> GetPropertiesByHostAsync(Guid hostId)
    {
        return await _propertyRepository.GetPropertiesByHostAsync(hostId);
    }

    public async Task<IEnumerable<Property>> SearchAvailablePropertiesAsync(
        string? city, 
        string? province,
        DateTime startDate, 
        DateTime endDate, 
        int? capacity)
    {
        // Validaciones básicas de congruencia de fechas
        if (startDate >= endDate)
        {
            throw new AppException(ErrorType.Validation, "La fecha de inicio (Check-in) debe ser anterior a la fecha de salida (Check-out).");
        }

        if (startDate.Date < DateTime.UtcNow.Date)
        {
            throw new AppException(ErrorType.Validation, "No se pueden realizar búsquedas en fechas pasadas.");
        }

        // Si las reglas de negocio pasan, delegamos el filtrado pesado a la Base de Datos
        return await _propertyRepository.SearchAvailablePropertiesAsync(city, province, startDate, endDate, capacity);
    }
}