using System.Collections.Concurrent;
using System.Text.Json;
using Oakveil.Backend.Application.Common;
using Oakveil.Backend.Domain.Repositories;

namespace Oakveil.Backend.Tests.Fakes;

public sealed class InMemoryDefinitionRepository : IDefinitionRepository
{
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<Guid, DefinitionRecord>> _store = new();

    public Task<DefinitionRecord> CreateAsync(string definitionType, string payloadJson, string? actor, CancellationToken cancellationToken)
    {
        var typeStore = _store.GetOrAdd(Normalize(definitionType), _ => new ConcurrentDictionary<Guid, DefinitionRecord>());
        var id = TryExtractId(payloadJson) ?? Guid.NewGuid();
        var key = ExtractKey(payloadJson);
        var now = DateTime.UtcNow;

        var record = new DefinitionRecord(
            id,
            Normalize(definitionType),
            key,
            payloadJson,
            now,
            now,
            actor,
            actor,
            false);

        typeStore[id] = record;
        return Task.FromResult(record);
    }

    public Task<DefinitionRecord?> GetByIdAsync(string definitionType, Guid id, CancellationToken cancellationToken)
    {
        var typeStore = _store.GetOrAdd(Normalize(definitionType), _ => new ConcurrentDictionary<Guid, DefinitionRecord>());
        typeStore.TryGetValue(id, out var record);
        return Task.FromResult(record);
    }

    public Task<PagedResponse<DefinitionRecord>> GetPagedAsync(string definitionType, int page, int pageSize, string? search, bool includeDeleted, CancellationToken cancellationToken)
    {
        var typeStore = _store.GetOrAdd(Normalize(definitionType), _ => new ConcurrentDictionary<Guid, DefinitionRecord>());

        IEnumerable<DefinitionRecord> records = typeStore.Values;

        if (!includeDeleted)
        {
            records = records.Where(x => !x.IsDeleted);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            records = records.Where(x =>
                x.Key.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                x.PayloadJson.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        var ordered = records.OrderByDescending(x => x.UpdatedAt).ToList();
        var total = ordered.Count;
        var items = ordered.Skip((page - 1) * pageSize).Take(pageSize).ToArray();

        return Task.FromResult(new PagedResponse<DefinitionRecord>(items, page, pageSize, total));
    }

    public Task<DefinitionRecord?> UpdateAsync(string definitionType, Guid id, string payloadJson, string? actor, CancellationToken cancellationToken)
    {
        var typeStore = _store.GetOrAdd(Normalize(definitionType), _ => new ConcurrentDictionary<Guid, DefinitionRecord>());

        if (!typeStore.TryGetValue(id, out var existing))
        {
            return Task.FromResult<DefinitionRecord?>(null);
        }

        var updated = existing with
        {
            Key = ExtractKey(payloadJson),
            PayloadJson = payloadJson,
            UpdatedAt = DateTime.UtcNow,
            UpdatedBy = actor
        };

        typeStore[id] = updated;
        return Task.FromResult<DefinitionRecord?>(updated);
    }

    public Task<bool> SoftDeleteAsync(string definitionType, Guid id, string? actor, CancellationToken cancellationToken)
    {
        var typeStore = _store.GetOrAdd(Normalize(definitionType), _ => new ConcurrentDictionary<Guid, DefinitionRecord>());

        if (!typeStore.TryGetValue(id, out var existing))
        {
            return Task.FromResult(false);
        }

        var deleted = existing with
        {
            IsDeleted = true,
            UpdatedAt = DateTime.UtcNow,
            UpdatedBy = actor
        };

        typeStore[id] = deleted;
        return Task.FromResult(true);
    }

    private static string Normalize(string definitionType)
    {
        var normalized = definitionType.Trim().ToLowerInvariant();
        return normalized.EndsWith("definition", StringComparison.Ordinal)
            ? normalized[..^"definition".Length]
            : normalized;
    }

    private static string ExtractKey(string payloadJson)
    {
        using var json = JsonDocument.Parse(payloadJson);
        if (json.RootElement.TryGetProperty("Key", out var keyProp))
        {
            return keyProp.GetString() ?? string.Empty;
        }

        if (json.RootElement.TryGetProperty("key", out var keyPropLower))
        {
            return keyPropLower.GetString() ?? string.Empty;
        }

        return string.Empty;
    }

    private static Guid? TryExtractId(string payloadJson)
    {
        using var json = JsonDocument.Parse(payloadJson);

        if (json.RootElement.TryGetProperty("Id", out var idProp) && idProp.ValueKind == JsonValueKind.String && Guid.TryParse(idProp.GetString(), out var id))
        {
            return id;
        }

        if (json.RootElement.TryGetProperty("id", out var idPropLower) && idPropLower.ValueKind == JsonValueKind.String && Guid.TryParse(idPropLower.GetString(), out var idLower))
        {
            return idLower;
        }

        return null;
    }
}
