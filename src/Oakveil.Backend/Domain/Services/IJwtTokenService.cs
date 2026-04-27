namespace Oakveil.Backend.Domain.Services;

public interface IJwtTokenService
{
    string GenerateToken(string email, IEnumerable<string> roles);
}
