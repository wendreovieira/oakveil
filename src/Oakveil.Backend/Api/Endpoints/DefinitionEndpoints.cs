using System.Security.Claims;
using System.Text.Json;
using MediatR;
using Oakveil.Backend.Application.Definitions;
using Oakveil.Backend.Application.Definitions.Commands;
using Oakveil.Backend.Application.Definitions.Queries;

namespace Oakveil.Backend.Api.Endpoints;

public static class DefinitionEndpoints
{
    public static IEndpointRouteBuilder MapDefinitionEndpoints(this IEndpointRouteBuilder app)
    {
        foreach (var definitionType in DefinitionTypeRegistry.Names.OrderBy(x => x))
        {
            var group = app.MapGroup($"/api/definitions/{definitionType}")
                .WithTags($"Definitions:{definitionType}");

            group.MapPost("/", (HttpContext ctx, JsonElement payload, ISender sender, CancellationToken ct) =>
                    CreateAsync(ctx, sender, definitionType, payload, ct))
                .RequireAuthorization("EditorOrAdmin");

            group.MapPut("/{id:guid}", (Guid id, HttpContext ctx, JsonElement payload, ISender sender, CancellationToken ct) =>
                    UpdateAsync(ctx, sender, definitionType, id, payload, ct))
                .RequireAuthorization("EditorOrAdmin");

            group.MapDelete("/{id:guid}", (Guid id, HttpContext ctx, ISender sender, CancellationToken ct) =>
                    DeleteAsync(ctx, sender, definitionType, id, ct))
                .RequireAuthorization("EditorOrAdmin");

            group.MapGet("/{id:guid}", (Guid id, bool includeDeleted, ISender sender, CancellationToken ct) =>
                    GetByIdAsync(sender, definitionType, id, includeDeleted, ct))
                .RequireAuthorization("ViewerOrAbove");

                    group.MapGet("/", (ISender sender, int page = 1, int pageSize = 20, string? search = null, bool includeDeleted = false, CancellationToken ct = default) =>
                    GetPagedAsync(sender, definitionType, page, pageSize, search, includeDeleted, ct))
                .RequireAuthorization("ViewerOrAbove");
        }

        return app;
    }

    private static async Task<IResult> CreateAsync(HttpContext context, ISender sender, string definitionType, JsonElement payload, CancellationToken ct)
    {
        var actor = context.User.FindFirstValue(ClaimTypes.Email) ?? context.User.Identity?.Name;
        var created = await sender.Send(new CreateDefinitionCommand(definitionType, payload, actor), ct);
        return Results.Created($"/api/definitions/{definitionType}/{created.Id}", created);
    }

    private static async Task<IResult> UpdateAsync(HttpContext context, ISender sender, string definitionType, Guid id, JsonElement payload, CancellationToken ct)
    {
        var actor = context.User.FindFirstValue(ClaimTypes.Email) ?? context.User.Identity?.Name;
        var updated = await sender.Send(new UpdateDefinitionCommand(definitionType, id, payload, actor), ct);
        return updated is null ? Results.NotFound() : Results.Ok(updated);
    }

    private static async Task<IResult> DeleteAsync(HttpContext context, ISender sender, string definitionType, Guid id, CancellationToken ct)
    {
        var actor = context.User.FindFirstValue(ClaimTypes.Email) ?? context.User.Identity?.Name;
        var removed = await sender.Send(new DeleteDefinitionCommand(definitionType, id, actor), ct);
        return removed ? Results.NoContent() : Results.NotFound();
    }

    private static async Task<IResult> GetByIdAsync(ISender sender, string definitionType, Guid id, bool includeDeleted, CancellationToken ct)
    {
        var result = await sender.Send(new GetDefinitionByIdQuery(definitionType, id, includeDeleted), ct);
        return result is null ? Results.NotFound() : Results.Ok(result);
    }

    private static async Task<IResult> GetPagedAsync(ISender sender, string definitionType, int page, int pageSize, string? search, bool includeDeleted, CancellationToken ct)
    {
        page = page <= 0 ? 1 : page;
        pageSize = pageSize <= 0 ? 20 : pageSize;

        var result = await sender.Send(new GetDefinitionsPagedQuery(definitionType, page, pageSize, search, includeDeleted), ct);
        return Results.Ok(result);
    }
}
