using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using Oakveil.Backend.Configuration;

namespace Oakveil.Backend.Infrastructure.Extensions;

public static class AppInitializationExtensions
{
    public static async Task EnsureSeedUserAsync(this IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var settings = scope.ServiceProvider.GetRequiredService<IOptions<SeedUserSettings>>().Value;

        if (!settings.Enabled || string.IsNullOrWhiteSpace(settings.Username) || string.IsNullOrWhiteSpace(settings.Password))
        {
            return;
        }

        var mongoSettings = scope.ServiceProvider.GetRequiredService<IOptions<MongoDbSettings>>().Value;
        var mongoClient = scope.ServiceProvider.GetRequiredService<IMongoClient>();
        var database = mongoClient.GetDatabase(mongoSettings.DatabaseName);
        var users = database.GetCollection<BsonDocument>("users");

        var filter = Builders<BsonDocument>.Filter.Eq("Email", settings.Username);
        var existing = await users.Find(filter).FirstOrDefaultAsync();
        var roles = settings.Roles.Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(settings.Password);

        if (existing is null)
        {
            var user = new BsonDocument
            {
                ["_id"] = Guid.NewGuid().ToString("D"),
                ["Email"] = settings.Username,
                ["PasswordHash"] = passwordHash,
                ["Roles"] = new BsonArray(roles)
            };

            await users.InsertOneAsync(user);
            return;
        }

        var update = Builders<BsonDocument>.Update
            .Set("PasswordHash", passwordHash)
            .Set("Roles", new BsonArray(roles));

        await users.UpdateOneAsync(filter, update);
    }
}
