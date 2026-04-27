using Oakveil.Backend.Domain.Repositories;
using Oakveil.Shared.Definitions;

namespace Oakveil.Backend.Tests.Fakes;

public sealed class InMemoryUserRepository : IUserRepository
{
    private readonly UserDefinition _user = new()
    {
        Email = "wendreo",
        PasswordHash = BCrypt.Net.BCrypt.HashPassword("140718"),
        Roles = ["Admin", "Editor", "Viewer"]
    };

    public Task<UserDefinition?> GetByEmailAsync(string email, CancellationToken cancellationToken)
    {
        if (!string.Equals(email, _user.Email, StringComparison.OrdinalIgnoreCase))
        {
            return Task.FromResult<UserDefinition?>(null);
        }

        return Task.FromResult<UserDefinition?>(_user);
    }
}
