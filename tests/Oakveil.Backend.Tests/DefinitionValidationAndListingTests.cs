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

public sealed class DefinitionValidationAndListingTests : IClassFixture<BackendWebApplicationFactory>
{
    private readonly BackendWebApplicationFactory _factory;

    public DefinitionValidationAndListingTests(BackendWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CreateInteraction_WithoutRequiredName_ShouldReturnValidationError()
    {
        using var client = CreateClient();
        var token = await LoginAsync(client, "wendreo", "140718");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.PostAsJsonAsync("/api/definitions/interaction/", new
        {
            Key = "interaction-without-name",
            EntryPoints = Array.Empty<object>(),
            Nodes = Array.Empty<object>()
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        json.RootElement.GetProperty("error").GetString().Should().Be("validation_failed");
    }

    [Fact]
    public async Task DeletedDefinition_ShouldAppearOnlyWhenIncludeDeletedIsTrue()
    {
        using var client = CreateClient();
        var token = await LoginAsync(client, "wendreo", "140718");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var key = $"texture-soft-delete-{Guid.NewGuid():N}";

        var createResponse = await client.PostAsJsonAsync("/api/definitions/texture/", new
        {
            Key = key,
            Path = "sprites/soft-delete.png",
            PixelPerfect = true,
            Tags = new[] { "soft-delete" }
        });

        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var createdJson = JsonDocument.Parse(await createResponse.Content.ReadAsStringAsync());
        var id = createdJson.RootElement.GetProperty("id").GetGuid();

        var deleteResponse = await client.DeleteAsync($"/api/definitions/texture/{id}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var normalGet = await client.GetAsync($"/api/definitions/texture/{id}");
        normalGet.StatusCode.Should().Be(HttpStatusCode.NotFound);

        var includeDeletedGet = await client.GetAsync($"/api/definitions/texture/{id}?includeDeleted=true");
        includeDeletedGet.StatusCode.Should().Be(HttpStatusCode.OK);

        var withDeletedList = await client.GetAsync($"/api/definitions/texture/?page=1&pageSize=20&search={key}&includeDeleted=true");
        withDeletedList.StatusCode.Should().Be(HttpStatusCode.OK);
        var withDeletedJson = JsonDocument.Parse(await withDeletedList.Content.ReadAsStringAsync());
        withDeletedJson.RootElement.GetProperty("totalCount").GetInt64().Should().BeGreaterThan(0);

        var withoutDeletedList = await client.GetAsync($"/api/definitions/texture/?page=1&pageSize=20&search={key}");
        withoutDeletedList.StatusCode.Should().Be(HttpStatusCode.OK);
        var withoutDeletedJson = JsonDocument.Parse(await withoutDeletedList.Content.ReadAsStringAsync());
        withoutDeletedJson.RootElement.GetProperty("totalCount").GetInt64().Should().Be(0);
    }

    [Fact]
    public async Task ListDefinitions_WithInvalidPageSize_ShouldReturnBadRequest()
    {
        using var client = CreateClient();
        var token = await LoginAsync(client, "wendreo", "140718");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/definitions/texture/?page=1&pageSize=500");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        json.RootElement.GetProperty("error").GetString().Should().Be("validation_failed");
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
