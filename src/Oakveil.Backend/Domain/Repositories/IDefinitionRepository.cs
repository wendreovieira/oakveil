using Oakveil.Backend.Application.Common;

namespace Oakveil.Backend.Domain.Repositories;

public interface IDefinitionRepository
{
    Task<DefinitionRecord> CreateAsync(string definitionType, string payloadJson, string? actor, CancellationToken cancellationToken);
    Task<DefinitionRecord?> GetByIdAsync(string definitionType, Guid id, CancellationToken cancellationToken);
    Task<PagedResponse<DefinitionRecord>> GetPagedAsync(string definitionType, int page, int pageSize, string? search, bool includeDeleted, CancellationToken cancellationToken);
    Task<DefinitionRecord?> UpdateAsync(string definitionType, Guid id, string payloadJson, string? actor, CancellationToken cancellationToken);
    Task<bool> SoftDeleteAsync(string definitionType, Guid id, string? actor, CancellationToken cancellationToken);
}
