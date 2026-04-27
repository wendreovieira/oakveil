using System.Text.Json;
using MongoDB.Bson;
using MongoDB.Driver;
using Oakveil.Backend.Application.Common;
using Oakveil.Backend.Configuration;
using Oakveil.Backend.Domain.Repositories;
using Microsoft.Extensions.Options;

namespace Oakveil.Backend.Infrastructure.Persistence;

public sealed class MongoDefinitionRepository : IDefinitionRepository
{
    private readonly IMongoDatabase _database;

    public MongoDefinitionRepository(IMongoClient mongoClient, IOptions<MongoDbSettings> settings)
    {
        _database = mongoClient.GetDatabase(settings.Value.DatabaseName);
    }

    public async Task<DefinitionRecord> CreateAsync(string definitionType, string payloadJson, string? actor, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var id = Guid.NewGuid();
        var idString = id.ToString("D");

        var payload = ToDocument(payloadJson);
        EnsureAuditFields(payload, id, now, actor, created: true);

        var key = payload.GetValue("Key", string.Empty).AsString;
        if (string.IsNullOrWhiteSpace(key))
        {
            throw new InvalidOperationException("Payload must include a non-empty Key field.");
        }

        var document = new BsonDocument
        {
            ["_id"] = idString,
            ["Type"] = Normalize(definitionType),
            ["Key"] = key,
            ["Payload"] = payload,
            ["CreatedAt"] = now,
            ["UpdatedAt"] = now,
            ["CreatedBy"] = actor is null ? BsonNull.Value : actor,
            ["UpdatedBy"] = actor is null ? BsonNull.Value : actor,
            ["IsDeleted"] = false
        };

        var collection = GetCollection(definitionType);
        await collection.InsertOneAsync(document, cancellationToken: cancellationToken);

        return ToRecord(document);
    }

    public async Task<DefinitionRecord?> GetByIdAsync(string definitionType, Guid id, CancellationToken cancellationToken)
    {
        var collection = GetCollection(definitionType);
        var filter = Builders<BsonDocument>.Filter.Eq("_id", id.ToString("D"));
        var doc = await collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
        return doc is null ? null : ToRecord(doc);
    }

    public async Task<PagedResponse<DefinitionRecord>> GetPagedAsync(string definitionType, int page, int pageSize, string? search, bool includeDeleted, CancellationToken cancellationToken)
    {
        var collection = GetCollection(definitionType);
        var filter = BuildListFilter(search, includeDeleted);

        var total = await collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);

        var docs = await collection
            .Find(filter)
            .SortByDescending(x => x["UpdatedAt"])
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(cancellationToken);

        var items = docs.Select(ToRecord).ToArray();
        return new PagedResponse<DefinitionRecord>(items, page, pageSize, total);
    }

    public async Task<DefinitionRecord?> UpdateAsync(string definitionType, Guid id, string payloadJson, string? actor, CancellationToken cancellationToken)
    {
        var collection = GetCollection(definitionType);
        var filter = Builders<BsonDocument>.Filter.Eq("_id", id.ToString("D"));
        var existing = await collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
        if (existing is null)
        {
            return null;
        }

        var payload = ToDocument(payloadJson);
        EnsureAuditFields(payload, id, DateTime.UtcNow, actor, created: false, existing);

        var key = payload.GetValue("Key", string.Empty).AsString;
        if (string.IsNullOrWhiteSpace(key))
        {
            throw new InvalidOperationException("Payload must include a non-empty Key field.");
        }

        var updated = new BsonDocument(existing)
        {
            ["Key"] = key,
            ["Payload"] = payload,
            ["UpdatedAt"] = DateTime.UtcNow,
            ["UpdatedBy"] = actor is null ? BsonNull.Value : actor
        };

        await collection.ReplaceOneAsync(filter, updated, cancellationToken: cancellationToken);
        return ToRecord(updated);
    }

    public async Task<bool> SoftDeleteAsync(string definitionType, Guid id, string? actor, CancellationToken cancellationToken)
    {
        var collection = GetCollection(definitionType);
        var filter = Builders<BsonDocument>.Filter.Eq("_id", id.ToString("D"));

        var update = Builders<BsonDocument>.Update
            .Set("IsDeleted", true)
            .Set("UpdatedAt", DateTime.UtcNow)
            .Set("UpdatedBy", (BsonValue)(actor is null ? BsonNull.Value : new BsonString(actor)));

        var result = await collection.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);
        return result.IsAcknowledged && result.MatchedCount > 0;
    }

    private IMongoCollection<BsonDocument> GetCollection(string definitionType)
    {
        return _database.GetCollection<BsonDocument>($"definitions_{Normalize(definitionType)}");
    }

    private static string Normalize(string definitionType)
    {
        var normalized = definitionType.Trim().ToLowerInvariant();
        return normalized.EndsWith("definition", StringComparison.Ordinal)
            ? normalized[..^"definition".Length]
            : normalized;
    }

    private static BsonDocument ToDocument(string payloadJson)
    {
        using var _ = JsonDocument.Parse(payloadJson);
        return BsonDocument.Parse(payloadJson);
    }

    private static FilterDefinition<BsonDocument> BuildListFilter(string? search, bool includeDeleted)
    {
        var filters = new List<FilterDefinition<BsonDocument>>();

        if (!includeDeleted)
        {
            filters.Add(Builders<BsonDocument>.Filter.Eq("IsDeleted", false));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var regex = new BsonRegularExpression(search, "i");
            var searchFilter = Builders<BsonDocument>.Filter.Or(
                Builders<BsonDocument>.Filter.Regex("Key", regex),
                Builders<BsonDocument>.Filter.Regex("Payload.Name", regex),
                Builders<BsonDocument>.Filter.Regex("Payload.Path", regex),
                Builders<BsonDocument>.Filter.Regex("Payload.Tags", regex)
            );
            filters.Add(searchFilter);
        }

        return filters.Count == 0 ? Builders<BsonDocument>.Filter.Empty : Builders<BsonDocument>.Filter.And(filters);
    }

    private static void EnsureAuditFields(BsonDocument payload, Guid id, DateTime now, string? actor, bool created, BsonDocument? existing = null)
    {
        payload["Id"] = id.ToString("D");
        payload["UpdatedAt"] = now;
        payload["UpdatedBy"] = actor is null ? BsonNull.Value : actor;

        if (created)
        {
            payload["CreatedAt"] = now;
            payload["CreatedBy"] = actor is null ? BsonNull.Value : actor;
            return;
        }

        payload["CreatedAt"] = existing?.GetValue("CreatedAt", now) ?? now;
        payload["CreatedBy"] = existing?.GetValue("CreatedBy", actor is null ? BsonNull.Value : actor) ?? (actor is null ? BsonNull.Value : actor);
    }

    private static DefinitionRecord ToRecord(BsonDocument doc)
    {
        var payload = doc.GetValue("Payload", new BsonDocument()).AsBsonDocument;
        return new DefinitionRecord(
            Guid.Parse(doc["_id"].AsString),
            doc.GetValue("Type", string.Empty).AsString,
            doc.GetValue("Key", string.Empty).AsString,
            payload.ToJson(),
            doc.GetValue("CreatedAt", DateTime.UtcNow).ToUniversalTime(),
            doc.GetValue("UpdatedAt", DateTime.UtcNow).ToUniversalTime(),
            doc.GetValue("CreatedBy", BsonNull.Value).IsBsonNull ? null : doc["CreatedBy"].AsString,
            doc.GetValue("UpdatedBy", BsonNull.Value).IsBsonNull ? null : doc["UpdatedBy"].AsString,
            doc.GetValue("IsDeleted", false).ToBoolean());
    }
}
