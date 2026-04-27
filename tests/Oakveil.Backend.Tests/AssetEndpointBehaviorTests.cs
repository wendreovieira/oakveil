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

public sealed class AssetEndpointBehaviorTests : IClassFixture<BackendWebApplicationFactory>
{
    private readonly BackendWebApplicationFactory _factory;

    public AssetEndpointBehaviorTests(BackendWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Upload_WithoutMultipartContentType_ShouldReturnBadRequest()
    {
        using var client = CreateClient();
        var token = await LoginAsync(client, "wendreo", "140718");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.PostAsJsonAsync("/api/assets/upload", new { file = "x" });
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Upload_WithViewerRole_ShouldReturnForbidden()
    {
        using var client = CreateClient();
        var token = await LoginAsync(client, "viewer", "140718");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        using var content = new MultipartFormDataContent();
        await using var stream = new MemoryStream([1, 2, 3]);
        using var fileContent = new StreamContent(stream);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        content.Add(fileContent, "file", "viewer.png");

        var response = await client.PostAsync("/api/assets/upload", content);
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Replace_WithoutFile_ShouldReturnBadRequest()
    {
        using var client = CreateClient();
        var token = await LoginAsync(client, "wendreo", "140718");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        using var content = new MultipartFormDataContent();
        var response = await client.PostAsync("/api/assets/replace/previews/test.png", content);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SignedUrl_WithViewerRole_ShouldReturnOk()
    {
        using var client = CreateClient();
        var token = await LoginAsync(client, "viewer", "140718");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/assets/signed-url/previews/some.png");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        json.RootElement.GetProperty("url").GetString().Should().Contain("fake-r2.local");
    }

    [Fact]
    public async Task Delete_WithEditorOrAdmin_ShouldReturnNoContent()
    {
        using var client = CreateClient();
        var token = await LoginAsync(client, "wendreo", "140718");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.DeleteAsync("/api/assets/previews/to-delete.png");
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
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
