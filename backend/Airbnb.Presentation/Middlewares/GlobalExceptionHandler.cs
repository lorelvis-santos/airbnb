
using Airbnb.Domain.Enum;
using Airbnb.Domain.Exceptions;
using Airbnb.Presentation.Models;
using Microsoft.AspNetCore.Diagnostics;

namespace Airbnb.Presentation.Middlewares;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Ocurrió una excepción: {Message}", exception.Message);

        // Si es una excepción de nuestra lógica de negocio:
        if (exception is AppException appException)
        {
            var statusCode = appException.Type switch
            {
                ErrorType.NotFound => StatusCodes.Status404NotFound,
                ErrorType.Conflict => StatusCodes.Status409Conflict,
                ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
                ErrorType.Validation => StatusCodes.Status400BadRequest,
                _ => StatusCodes.Status500InternalServerError
            };

            var response = ApiResponse<object>.Failure(appException.Message);

            context.Response.StatusCode = statusCode;
            await context.Response.WriteAsJsonAsync(response, cancellationToken);

            return true;
        } 
        else if (exception is BadHttpRequestException badRequestException)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            var response = ApiResponse<object>.Failure("El formato de la petición es incorrecto o no se envió el cuerpo (JSON) requerido.");
            
            await context.Response.WriteAsJsonAsync(response, cancellationToken);
            return true;
        }

        // Manejo de errores no controlados (Errores 500)
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        var fatalResponse = ApiResponse<object>.Failure("Ocurrió un error interno en el servidor.");
        await context.Response.WriteAsJsonAsync(fatalResponse, cancellationToken);

        return true;
    }
}