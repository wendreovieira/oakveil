using System.Text.Json.Nodes;
using Oakveil.Backend.Application.Common;
using Oakveil.Backend.Domain.Repositories;

namespace Oakveil.Backend.Application.Definitions;

public static class DefinitionDtoMapper
{
    public static DefinitionRecordDto Map(DefinitionRecord record)
    {
        var payload = JsonNode.Parse(record.PayloadJson) as JsonObject ?? new JsonObject();

        return new DefinitionRecordDto(
            record.Id,
            record.Type,
            record.Key,
            payload,
            record.CreatedAt,
            record.UpdatedAt,
            record.CreatedBy,
            record.UpdatedBy,
            record.IsDeleted);
    }
}
