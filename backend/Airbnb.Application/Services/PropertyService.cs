using Airbnb.Application.Dtos.Property;
using Airbnb.Application.Interfaces;
using Airbnb.Domain.Entities;
using Airbnb.Domain.Enum;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;
using Airbnb.Application.Dtos;

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

    public async Task<PagedResult<PropertyResponseDto>> GetAllPropertiesAsync(int pageNumber = 1, int pageSize = 12)
    {
        var query = _propertyRepository.GetQueryable();

        // Llamamos al repositorio pasándole la consulta base, la expresión de mapeo y los datos de paginación
        var (items, totalCount) = await _propertyRepository.GetPagedProjectedAsync(
            query,
            // Esta es la Expression<Func<Property, PropertyResponseDto>>
            p => new PropertyResponseDto
            {
                Id = p.Id,
                Title = p.Title,
                City = p.City,
                Province = p.Province,
                PricePerNight = p.PricePerNight,
                Capacity = p.Capacity,
                Host = p.Host != null ? new HostSimpleDto 
                {
                    Id = p.HostId,
                    FullName = p.Host.FullName
                } : null,
                Images = p.Images.Select(i => new PropertyImageDto 
                { 
                    Id = i.Id, 
                    Url = i.Url 
                }).ToList(),
                AverageRating = p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0,
                ReviewsCount = p.Reviews.Count()
            },
            pageNumber,
            pageSize
        );

        // Retornamos el envolvente final a la API
        return new PagedResult<PropertyResponseDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<PropertyDetailDto> GetPropertyByIdAsync(Guid id)
    {
        var property = await _propertyRepository.GetByIdWithDetailsAsync(id);
        
        if (property == null) throw new AppException(ErrorType.NotFound, "Propiedad no encontrada.");

        return new PropertyDetailDto
        {
            Id = property.Id,
            Title = property.Title,
            Description = property.Description,
            City = property.City,
            Province = property.Province,
            PricePerNight = property.PricePerNight,
            Capacity = property.Capacity,
            Host = property.Host != null ? 
                new HostSimpleDto { Id = property.Host.Id, FullName = property.Host.FullName } :
                null,
            Images = [.. property.Images.Select(i => new PropertyImageDto 
                { 
                    Id = i.Id, 
                    Url = i.Url 
                })],
            Blocks = [.. property.Blocks.Select(b => new PropertyBlockDto { StartDate = b.StartDate, EndDate = b.EndDate })],
            Reservations = [.. property.Reservations
                .Where(r => r.Status == ReservationStatus.Confirmed)
                .Select(r => new ReservationDateDto
                {
                    CheckIn = r.CheckIn,
                    CheckOut = r.CheckOut
                })]
        };
    }

    public async Task<PagedResult<PropertyResponseDto>> GetPropertiesByHostAsync(Guid hostId, int pageNumber = 1, int pageSize = 12)
    {
        // Asumiendo que GetPropertiesByHostAsync del repo devuelve un IEnumerable
        var properties = await _propertyRepository.GetPropertiesByHostAsync(hostId);
        
        // Contamos el total para la metadata de la paginación
        var totalCount = properties.Count();

        // Paginamos en memoria y Mapeamos a DTO
        var propertyDtos = properties
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PropertyResponseDto
            {
                Id = p.Id,
                Title = p.Title,
                City = p.City,
                Province = p.Province,
                PricePerNight = p.PricePerNight,
                Capacity = p.Capacity,
                Host = p.Host != null ? new HostSimpleDto 
                {
                    Id = p.Host.Id,
                    FullName = p.Host.FullName
                } : null,
                Images = [.. p.Images.Select(i => new PropertyImageDto 
                { 
                    Id = i.Id, 
                    Url = i.Url 
                })],
                AverageRating = p.Reviews != null && p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0,
                ReviewsCount = p.Reviews != null ? p.Reviews.Count : 0
            }).ToList();

        return new PagedResult<PropertyResponseDto>
        {
            Items = propertyDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    // CORRECCIÓN 3: Implementación de la paginación para el Buscador
    public async Task<PagedResult<PropertyResponseDto>> SearchAvailablePropertiesAsync(
        string? city, 
        string? province,
        DateTime startDate, 
        DateTime endDate, 
        int? capacity,
        decimal? minPrice,
        decimal? maxPrice,
        int pageNumber = 1, 
        int pageSize = 12
    )
    {
        if (startDate >= endDate)
        {
            throw new AppException(ErrorType.Validation, "La fecha de inicio (Check-in) debe ser anterior a la fecha de salida (Check-out).");
        }

        if (startDate.Date < DateTime.UtcNow.Date)
        {
            throw new AppException(ErrorType.Validation, "No se pueden realizar búsquedas en fechas pasadas.");
        }

        // Buscamos las entidades
        var properties = await _propertyRepository.SearchAvailablePropertiesAsync(city, province, startDate, endDate, capacity, minPrice, maxPrice);

        // Contamos el total para la metadata de la paginación
        var totalCount = properties.Count();

        // Paginamos en memoria y Mapeamos a DTO
        var propertyDtos = properties
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PropertyResponseDto
            {
                Id = p.Id,
                Title = p.Title,
                City = p.City,
                Province = p.Province,
                PricePerNight = p.PricePerNight,
                Capacity = p.Capacity,
                Host = p.Host != null ? new HostSimpleDto 
                {
                    Id = p.Host.Id,
                    FullName = p.Host.FullName
                } : null,
                Images = [.. p.Images.Select(i => new PropertyImageDto 
                { 
                    Id = i.Id, 
                    Url = i.Url 
                })],
                AverageRating = p.Reviews != null && p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0,
                ReviewsCount = p.Reviews != null ? p.Reviews.Count : 0
            }).ToList();

        return new PagedResult<PropertyResponseDto>
        {
            Items = propertyDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
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