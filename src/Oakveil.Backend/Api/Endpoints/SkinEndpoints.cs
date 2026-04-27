using System.Security.Claims;
using MediatR;
using Oakveil.Backend.Application.Definitions.Commands;

namespace Oakveil.Backend.Api.Endpoints;

public static class SkinEndpoints
{
    public static IEndpointRouteBuilder MapSkinEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/definitions/skin/with-images", CreateWithImagesAsync)
            .DisableAntiforgery()
            .RequireAuthorization("EditorOrAdmin")
            .Accepts<IFormFile>("multipart/form-data")
            .WithName("CreateSkinWithImages")
            .WithTags("Definitions:skin");

        return app;
    }

    private static async Task<IResult> CreateWithImagesAsync(
        HttpContext context,
        HttpRequest request,
        ISender sender,
        CancellationToken ct
    )
    {
        if (!request.HasFormContentType)
        {
            return Results.BadRequest(new { error = "multipart/form-data required" });
        }

        IFormCollection form;
        try
        {
            form = await request.ReadFormAsync(ct);
        }
        catch (InvalidDataException)
        {
            return Results.BadRequest(new { error = "invalid multipart form data" });
        }

        // Required fields
        var slotId = form["slotId"].FirstOrDefault();
        if (string.IsNullOrEmpty(slotId))
            return Results.BadRequest(new { error = "slotId is required" });

        var eastWestMirroredStr = form["eastWestMirrored"].FirstOrDefault() ?? "true";
        var northInvisibleStr = form["northInvisible"].FirstOrDefault() ?? "false";
        var key = form["key"].FirstOrDefault();

        if (!bool.TryParse(eastWestMirroredStr, out var eastWestMirrored))
            eastWestMirrored = true;
        if (!bool.TryParse(northInvisibleStr, out var northInvisible))
            northInvisible = false;

        // Parse tags (comma-separated or JSON array in string)
        var tags = new List<string>();
        var tagsStr = form["tags"].FirstOrDefault();
        if (!string.IsNullOrEmpty(tagsStr))
        {
            if (tagsStr.StartsWith('['))
            {
                // Try to parse as JSON array
                try
                {
                    tags = System.Text.Json.JsonSerializer.Deserialize<List<string>>(tagsStr) ?? new();
                }
                catch
                {
                    tags = tagsStr.Split(',', System.StringSplitOptions.RemoveEmptyEntries)
                        .Select(t => t.Trim())
                        .ToList();
                }
            }
            else
            {
                tags = tagsStr.Split(',', System.StringSplitOptions.RemoveEmptyEntries)
                    .Select(t => t.Trim())
                    .ToList();
            }
        }

        // Collect direction files
        var directionFiles = new Dictionary<string, IFormFile>();
        foreach (var direction in new[] { "south", "north", "east", "west" })
        {
            var file = form.Files[direction];
            if (file != null && file.Length > 0)
            {
                directionFiles[direction] = file;
            }
        }

        if (directionFiles.Count == 0)
            return Results.BadRequest(new { error = "at least one direction image is required" });

        // Collect UV IDs
        var directionUvIds = new Dictionary<string, string>();
        foreach (var direction in new[] { "south", "north", "east", "west" })
        {
            var uvId = form[$"{direction}UvId"].FirstOrDefault();
            if (!string.IsNullOrEmpty(uvId))
            {
                directionUvIds[direction] = uvId;
            }
        }

        var actor = context.User.FindFirstValue(ClaimTypes.Email) ?? context.User.Identity?.Name;

        var command = new CreateSkinWithImagesCommand(
            SlotId: slotId,
            DirectionFiles: directionFiles,
            DirectionUvIds: directionUvIds.Count > 0 ? directionUvIds : null,
            EastWestMirrored: eastWestMirrored,
            NorthInvisible: northInvisible,
            Tags: tags.Count > 0 ? tags : null,
            Key: key,
            Actor: actor
        );

        var result = await sender.Send(command, ct);
        return Results.Created($"/api/definitions/skin/{result.Id}", result);
    }
}
