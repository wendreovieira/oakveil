using Oakveil.Backend.Domain.Repositories;
using Oakveil.Shared.Definitions;

namespace Oakveil.Backend.Tests.Fakes;

public sealed class InMemoryUserRepository : IUserRepository
{
    private readonly Dictionary<string, UserDefinition> _users = new(StringComparer.OrdinalIgnoreCase)
    {
        ["wendreo"] = new UserDefinition
        {
            Email = "wendreo",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("140718"),
            Roles = ["Admin", "Editor", "Viewer"]
        },
        ["viewer"] = new UserDefinition
        {
            Email = "viewer",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("140718"),
            Roles = ["Viewer"]
        }
    };

    public Task<UserDefinition?> GetByEmailAsync(string email, CancellationToken cancellationToken)
    {
        if (!_users.TryGetValue(email, out var user))
        {
            return Task.FromResult<UserDefinition?>(null);
        }

        return Task.FromResult<UserDefinition?>(user);
    }
}
