using Airbnb.Domain.Enum;

namespace Airbnb.Domain.Exceptions;

public class AppException : Exception
{
    public ErrorType Type { get; }

    public AppException(ErrorType type, string message) : base (message)
    {
        Type = type;
    }
}