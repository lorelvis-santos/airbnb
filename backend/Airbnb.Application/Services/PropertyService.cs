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
    private readonly IRepository<PropertyImage> _imageRepository;
    private readonly IFileStorageService _storageService;
    private readonly IRepository<PropertyBlock> _blockRepository;

    public PropertyService(
        IPropertyRepository propertyRepository,
        IRepository<PropertyImage> imageRepository,
        IFileStorageService storageService,
        IRepository<PropertyBlock> blockRepository
    )
    {
        _propertyRepository = propertyRepository;
        _imageRepository = imageRepository;
        _storageService = storageService;
        _blockRepository = blockRepository;        
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
            HostId = hostId
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

    public async Task<List<string>> UploadPropertyImagesAsync(Guid propertyId, Guid hostId, List<(Stream Content, string Extension)> files)
    {
        var property = await _propertyRepository.GetByIdAsync(propertyId);
        
        if (property == null)
        {
            throw new AppException(ErrorType.NotFound, "Propiedad no encontrada.");
        }

        if (property.HostId != hostId)
        {
            throw new AppException(ErrorType.Unauthorized, "No tienes permiso para modificar esta propiedad.");
        }

        if (files == null || files.Count == 0)
        {
            throw new AppException(ErrorType.Validation, "No se enviaron archivos.");
        }

        var uploadedUrls = new List<string>();

        foreach (var file in files)
        {
            // Delegamos el guardado físico a la Infraestructura
            var relativeUrl = await _storageService.SaveFileAsync(file.Content, file.Extension);

            var propertyImage = new PropertyImage
            {
                Id = Guid.NewGuid(),
                PropertyId = propertyId,
                Url = relativeUrl
            };

            await _imageRepository.AddAsync(propertyImage);
            uploadedUrls.Add(relativeUrl);
        }

        return uploadedUrls;
    }

    public async Task DeletePropertyImageAsync(Guid propertyId, Guid imageId, Guid hostId)
    {
        var property = await _propertyRepository.GetByIdAsync(propertyId);
        
        if (property == null)
        {
            throw new AppException(ErrorType.NotFound, "Propiedad no encontrada.");
        }
            
        if (property.HostId != hostId)
        {
            throw new AppException(ErrorType.Unauthorized, "No tienes permiso para modificar esta propiedad.");
        }

        var image = await _imageRepository.GetByIdAsync(imageId);
        
        // Validamos que la imagen exista y pertenezca a la propiedad especificada
        if (image == null || image.PropertyId != propertyId)
        {
            throw new AppException(ErrorType.NotFound, "La imagen especificada no existe en este alojamiento.");
        }

        // 1. Eliminamos el archivo físico del servidor
        await _storageService.DeleteFileAsync(image.Url);

        // 2. Eliminamos el registro de la base de datos
        await _imageRepository.DeleteAsync(image);
    }

    public async Task<PropertyBlock> BlockPropertyDatesAsync(Guid propertyId, Guid hostId, CreatePropertyBlockDto dto)
    {
        var property = await _propertyRepository.GetByIdAsync(propertyId);
        
        if (property == null)
        {
            throw new AppException(ErrorType.NotFound, "Propiedad no encontrada.");
        }

        if (property.HostId != hostId)
        {
            throw new AppException(ErrorType.Unauthorized, "No tienes permiso para modificar esta propiedad.");
        }
        
        if (dto.StartDate.Date < DateTime.UtcNow.Date)
        {
            throw new AppException(ErrorType.Validation, "No puedes bloquear fechas en el pasado.");
        }
            
        if (dto.StartDate >= dto.EndDate)
        {
            throw new AppException(ErrorType.Validation, "La fecha de inicio debe ser anterior a la fecha de fin.");
        }

        var block = new PropertyBlock
        {
            Id = Guid.NewGuid(),
            PropertyId = propertyId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate
        };

        await _blockRepository.AddAsync(block);
        return block;
    }

    public async Task DeletePropertyBlockAsync(Guid propertyId, Guid blockId, Guid hostId)
    {
        var property = await _propertyRepository.GetByIdAsync(propertyId);
        
        if (property == null) throw new AppException(ErrorType.NotFound, "Propiedad no encontrada.");
        if (property.HostId != hostId) throw new AppException(ErrorType.Unauthorized, "No tienes permiso para modificar esta propiedad.");

        var block = await _blockRepository.GetByIdAsync(blockId);
        
        if (block == null || block.PropertyId != propertyId)
        {
            throw new AppException(ErrorType.NotFound, "El bloqueo especificado no existe en este alojamiento.");
        }

        await _blockRepository.DeleteAsync(block);
    }
}