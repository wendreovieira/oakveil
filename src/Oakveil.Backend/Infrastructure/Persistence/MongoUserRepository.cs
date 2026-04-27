using MongoDB.Bson;
using MongoDB.Driver;
using Oakveil.Backend.Configuration;
using Oakveil.Backend.Domain.Repositories;
using Oakveil.Shared.Definitions;
using Microsoft.Extensions.Options;

namespace Oakveil.Backend.Infrastructure.Persistence;

public sealed class MongoUserRepository : IUserRepository
{
    private readonly IMongoCollection<BsonDocument> _collection;

    public MongoUserRepository(IMongoClient mongoClient, IOptions<MongoDbSettings> settings)
    {
        var database = mongoClient.GetDatabase(settings.Value.DatabaseName);
        _collection = database.GetCollection<BsonDocument>("users");
    }

    public async Task<UserDefinition?> GetByEmailAsync(string email, CancellationToken cancellationToken)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("Email", email);
        var doc = await _collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
        if (doc is null)
        {
            return null;
        }

        var user = new UserDefinition
        {
            Email = doc.GetValue("Email", string.Empty).AsString,
            PasswordHash = doc.GetValue("PasswordHash", string.Empty).AsString,
            Roles = doc.TryGetValue("Roles", out var roles) && roles.IsBsonArray
                ? roles.AsBsonArray.Select(x => x.AsString).ToList()
                : []
        };

        return user;
    }
}
