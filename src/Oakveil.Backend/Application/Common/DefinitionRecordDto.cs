using System.Text.Json.Nodes;

namespace Oakveil.Backend.Application.Common;

public sealed record DefinitionRecordDto(
    Guid Id,
    string Type,
    string Key,
    JsonObject Payload,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string? CreatedBy,
    string? UpdatedBy,
    bool IsDeleted);
