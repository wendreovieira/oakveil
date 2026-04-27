using MongoDB.Driver;
using Oakveil.Backend.Configuration;
using Oakveil.Backend.Domain.Repositories;
using Oakveil.Shared.Definitions;
using Microsoft.Extensions.Options;

namespace Oakveil.Backend.Infrastructure.Persistence;

public sealed class MongoUserRepository : IUserRepository
{
    private readonly IMongoCollection<UserDefinition> _collection;

    public MongoUserRepository(IMongoClient mongoClient, IOptions<MongoDbSettings> settings)
    {
        var database = mongoClient.GetDatabase(settings.Value.DatabaseName);
        _collection = database.GetCollection<UserDefinition>("users");
    }

    public async Task<UserDefinition?> GetByEmailAsync(string email, CancellationToken cancellationToken)
    {
        var filter = Builders<UserDefinition>.Filter.Eq(x => x.Email, email);
        return await _collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }
}
