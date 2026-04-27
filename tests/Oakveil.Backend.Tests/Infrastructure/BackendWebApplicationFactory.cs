using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Oakveil.Backend.Configuration;
using Oakveil.Backend.Domain.Repositories;
using Oakveil.Backend.Domain.Services;
using Oakveil.Backend.Tests.Fakes;

namespace Oakveil.Backend.Tests.Infrastructure;

public sealed class BackendWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            var values = new Dictionary<string, string?>
            {
                ["MongoDbSettings:ConnectionString"] = "mongodb://localhost:27017",
                ["MongoDbSettings:DatabaseName"] = "oakveil-tests",
                ["JwtSettings:Issuer"] = "Oakveil.Test",
                ["JwtSettings:Audience"] = "Oakveil.Test.Client",
                ["JwtSettings:SecretKey"] = "this-is-a-very-long-secret-key-for-tests-only",
                ["JwtSettings:ExpirationMinutes"] = "120",
                ["S3Settings:ServiceUrl"] = "https://example.r2.cloudflarestorage.com",
                ["S3Settings:BucketName"] = "oakveil-tests",
                ["S3Settings:Region"] = "auto",
                ["S3Settings:AccessKey"] = "test",
                ["S3Settings:SecretKey"] = "test",
                ["SeedUserSettings:Enabled"] = "false",
                ["SeedUserSettings:Username"] = "wendreo",
                ["SeedUserSettings:Password"] = "140718",
                ["SeedUserSettings:Roles:0"] = "Admin",
                ["SeedUserSettings:Roles:1"] = "Editor",
                ["SeedUserSettings:Roles:2"] = "Viewer"
            };

            config.AddInMemoryCollection(values);
        });

        builder.ConfigureServices(services =>
        {
            services.AddSingleton<IDefinitionRepository, InMemoryDefinitionRepository>();
            services.AddSingleton<IUserRepository, InMemoryUserRepository>();
            services.AddSingleton<IAssetStorageService, FakeAssetStorageService>();
            services.Configure<SeedUserSettings>(options =>
            {
                options.Enabled = false;
                options.Username = "wendreo";
                options.Password = "140718";
                options.Roles = ["Admin", "Editor", "Viewer"];
            });
        });
    }
}
