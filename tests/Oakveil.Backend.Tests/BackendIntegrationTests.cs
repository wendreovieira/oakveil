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

public sealed class BackendIntegrationTests : IClassFixture<BackendWebApplicationFactory>
{
    private readonly HttpClient _client;

    public BackendIntegrationTests(BackendWebApplicationFactory factory)
    {
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });
    }

    [Fact]
    public async Task Health_ShouldReturnOk()
    {
        var response = await _client.GetAsync("/health");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Login_ShouldReturnJwtToken_ForSeededUser()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "wendreo",
            Password = "140718"
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var payload = await response.Content.ReadFromJsonAsync<LoginResponse>();
        payload.Should().NotBeNull();
        payload!.Token.Should().NotBeNullOrWhiteSpace();
        payload.Roles.Should().Contain("Admin");
    }

    [Fact]
    public async Task DefinitionsCrud_Texture_ShouldWorkEndToEnd()
    {
        var token = await LoginAndGetTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createResponse = await _client.PostAsJsonAsync("/api/definitions/texture/", new
        {
            Key = "texture-crud-test",
            Path = "sprites/test.png",
            PixelPerfect = true,
            Tags = new[] { "test" }
        });

        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var createdJson = JsonDocument.Parse(await createResponse.Content.ReadAsStringAsync());
        var id = createdJson.RootElement.GetProperty("id").GetGuid();

        var getByIdResponse = await _client.GetAsync($"/api/definitions/texture/{id}");
        getByIdResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var updateResponse = await _client.PutAsJsonAsync($"/api/definitions/texture/{id}", new
        {
            Key = "texture-crud-test-updated",
            Path = "sprites/test-updated.png",
            PixelPerfect = false,
            Tags = new[] { "updated" }
        });
        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var listResponse = await _client.GetAsync("/api/definitions/texture/?page=1&pageSize=10&search=updated");
        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var deleteResponse = await _client.DeleteAsync($"/api/definitions/texture/{id}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var shouldBeGone = await _client.GetAsync($"/api/definitions/texture/{id}");
        shouldBeGone.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task AssetUpload_WithAuthenticatedUser_ShouldReturnObjectKeyAndUrl()
    {
        var token = await LoginAndGetTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        using var content = new MultipartFormDataContent();
        await using var stream = new MemoryStream([1, 2, 3, 4]);
        using var fileContent = new StreamContent(stream);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");

        content.Add(fileContent, "file", "preview.png");
        content.Add(new StringContent("previews"), "folder");
        content.Add(new StringContent("true"), "isPublic");

        var response = await _client.PostAsync("/api/assets/upload", content);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var payload = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        payload.RootElement.GetProperty("objectKey").GetString().Should().Contain("previews/");
        payload.RootElement.GetProperty("url").GetString().Should().Contain("fake-r2.local");
    }

    private async Task<string> LoginAndGetTokenAsync()
    {
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "wendreo",
            Password = "140718"
        });

        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        payload.Should().NotBeNull();
        return payload!.Token;
    }
}
