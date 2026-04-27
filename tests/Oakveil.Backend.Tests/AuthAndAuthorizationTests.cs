using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Oakveil.Backend.Application.Auth.Models;
using Oakveil.Backend.Tests.Infrastructure;
using Xunit;

namespace Oakveil.Backend.Tests;

public sealed class AuthAndAuthorizationTests : IClassFixture<BackendWebApplicationFactory>
{
    private readonly BackendWebApplicationFactory _factory;

    public AuthAndAuthorizationTests(BackendWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ShouldReturnUnauthorized()
    {
        using var client = CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "wendreo",
            Password = "wrong-pass"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        json.RootElement.GetProperty("error").GetString().Should().Be("unauthorized");
    }

    [Fact]
    public async Task Login_WithShortPassword_ShouldReturnBadRequest()
    {
        using var client = CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "wendreo",
            Password = "123"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        json.RootElement.GetProperty("error").GetString().Should().Be("validation_failed");
    }

    [Fact]
    public async Task Definitions_Create_WithoutToken_ShouldReturnUnauthorized()
    {
        using var client = CreateClient();

        var response = await client.PostAsJsonAsync("/api/definitions/texture/", new
        {
            Key = "no-token",
            Path = "sprites/no-token.png",
            PixelPerfect = true,
            Tags = new[] { "test" }
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Definitions_Create_WithViewerRole_ShouldReturnForbidden()
    {
        using var client = CreateClient();
        var token = await LoginAsync(client, "viewer", "140718");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.PostAsJsonAsync("/api/definitions/texture/", new
        {
            Key = "viewer-create",
            Path = "sprites/viewer.png",
            PixelPerfect = true,
            Tags = new[] { "test" }
        });

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Definitions_List_WithViewerRole_ShouldReturnOk()
    {
        using var client = CreateClient();
        var token = await LoginAsync(client, "viewer", "140718");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/definitions/texture/?page=1&pageSize=10");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    private HttpClient CreateClient() => _factory.CreateClient(new WebApplicationFactoryClientOptions
    {
        BaseAddress = new Uri("https://localhost")
    });

    private static async Task<string> LoginAsync(HttpClient client, string email, string password)
    {
        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = email,
            Password = password
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await response.Content.ReadFromJsonAsync<LoginResponse>();
        payload.Should().NotBeNull();
        return payload!.Token;
    }
}
