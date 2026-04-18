// Airbnb.Presentation/Models/ApiResponse.cs
namespace Airbnb.Presentation.Models;

public class ApiResponse<T>
{
    public bool Ok { get; set; }
    public T? Data { get; set; }
    public List<string> Errors { get; set; } = [];

    // Constructor privado para forzar el uso de los métodos estáticos
    private ApiResponse() { }

    // Helper para respuestas exitosas
    public static ApiResponse<T> Success(T data)
    {
        return new ApiResponse<T> { Ok = true, Data = data };
    }

    // Helper para respuestas fallidas (múltiples errores)
    public static ApiResponse<T> Failure(List<string> errors)
    {
        return new ApiResponse<T> { Ok = false, Errors = errors };
    }

    // Helper para respuestas fallidas (un solo error)
    public static ApiResponse<T> Failure(string error)
    {
        return new ApiResponse<T> { Ok = false, Errors = [error] };
    }
}