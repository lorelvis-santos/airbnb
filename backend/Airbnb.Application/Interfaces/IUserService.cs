namespace Airbnb.Application.Interfaces;

public interface IUserService
{
    Task BecomeHostAsync(Guid userId);
}