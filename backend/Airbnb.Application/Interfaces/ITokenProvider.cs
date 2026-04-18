using Airbnb.Domain.Entities;

namespace Airbnb.Application.Interfaces;

public interface ITokenProvider
{
    string GenerateToken(User user);
}