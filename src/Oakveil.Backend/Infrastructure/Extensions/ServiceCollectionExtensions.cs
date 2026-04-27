using System.Text;
using Amazon.Runtime;
using Amazon.S3;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using MongoDB.Driver;
using Oakveil.Backend.Application.Behaviors;
using Oakveil.Backend.Configuration;
using Oakveil.Backend.Domain.Repositories;
using Oakveil.Backend.Domain.Services;
using Oakveil.Backend.Infrastructure.Auth;
using Oakveil.Backend.Infrastructure.Persistence;
using Oakveil.Backend.Infrastructure.Storage;

namespace Oakveil.Backend.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBackendServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<MongoDbSettings>(configuration.GetSection("MongoDbSettings"));
        services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));
        services.Configure<S3Settings>(configuration.GetSection("S3Settings"));

        var mongoSettings = configuration.GetSection("MongoDbSettings").Get<MongoDbSettings>() ?? new MongoDbSettings();
        services.AddSingleton<IMongoClient>(_ => new MongoClient(mongoSettings.ConnectionString));

        var s3Settings = configuration.GetSection("S3Settings").Get<S3Settings>() ?? new S3Settings();
        var s3Config = new AmazonS3Config
        {
            ServiceURL = s3Settings.ServiceUrl,
            ForcePathStyle = true,
            AuthenticationRegion = string.IsNullOrWhiteSpace(s3Settings.Region) ? "auto" : s3Settings.Region
        };
        var credentials = new BasicAWSCredentials(s3Settings.AccessKey, s3Settings.SecretKey);
        services.AddSingleton<IAmazonS3>(_ => new AmazonS3Client(credentials, s3Config));

        services.AddScoped<IDefinitionRepository, MongoDefinitionRepository>();
        services.AddScoped<IUserRepository, MongoUserRepository>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IAssetStorageService, R2AssetStorageService>();

        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(ServiceCollectionExtensions).Assembly));
        services.AddValidatorsFromAssembly(typeof(ServiceCollectionExtensions).Assembly);
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                var jwt = configuration.GetSection("JwtSettings").Get<JwtSettings>() ?? new JwtSettings();
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ValidIssuer = jwt.Issuer,
                    ValidAudience = jwt.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SecretKey)),
                    ClockSkew = TimeSpan.FromSeconds(30)
                };
            });

        services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminOnly", p => p.RequireRole("Admin"));
            options.AddPolicy("EditorOrAdmin", p => p.RequireRole("Admin", "Editor"));
            options.AddPolicy("ViewerOrAbove", p => p.RequireRole("Admin", "Editor", "Viewer"));
        });

        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo { Title = "Oakveil Backend API", Version = "v1" });

            var securityScheme = new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Enter JWT token"
            };

            options.AddSecurityDefinition("Bearer", securityScheme);
        });

        return services;
    }
}
