namespace Oakveil.Backend.Domain.Repositories;

public sealed record DefinitionRecord(
    Guid Id,
    string Type,
    string Key,
    string PayloadJson,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string? CreatedBy,
    string? UpdatedBy,
    bool IsDeleted);
