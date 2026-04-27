using Oakveil.Shared.Definitions;

namespace Oakveil.Backend.Domain.Repositories;

public interface IUserRepository
{
    Task<UserDefinition?> GetByEmailAsync(string email, CancellationToken cancellationToken);
}
