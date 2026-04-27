using Oakveil.Backend.Domain.Services;

namespace Oakveil.Backend.Api.Endpoints;

public static class AssetEndpoints
{
    public static IEndpointRouteBuilder MapAssetEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/assets").WithTags("Assets");

        group.MapPost("/upload", UploadAsync)
            .DisableAntiforgery()
            .RequireAuthorization("EditorOrAdmin");

        group.MapDelete("/{*objectKey}", DeleteAsync)
            .RequireAuthorization("EditorOrAdmin");

        group.MapPost("/replace/{*objectKey}", ReplaceAsync)
            .DisableAntiforgery()
            .RequireAuthorization("EditorOrAdmin");

        group.MapGet("/signed-url/{*objectKey}", GetSignedUrl)
            .RequireAuthorization("ViewerOrAbove");

        return app;
    }

    private static async Task<IResult> UploadAsync(HttpRequest request, IAssetStorageService storage, CancellationToken ct)
    {
        if (!request.HasFormContentType)
        {
            return Results.BadRequest(new { error = "multipart/form-data required" });
        }

        var form = await request.ReadFormAsync(ct);
        var file = form.Files.FirstOrDefault();
        if (file is null)
        {
            return Results.BadRequest(new { error = "file is required" });
        }

        var folder = form["folder"].FirstOrDefault() ?? "assets";
        var isPublic = bool.TryParse(form["isPublic"].FirstOrDefault(), out var parsed) && parsed;
        var extension = Path.GetExtension(file.FileName);
        var objectKey = $"{folder.Trim('/')}/{Guid.NewGuid():N}{extension}";

        await using var stream = file.OpenReadStream();
        var result = await storage.UploadAsync(stream, objectKey, file.ContentType ?? "application/octet-stream", isPublic, ct);

        return Results.Ok(result);
    }

    private static async Task<IResult> DeleteAsync(string objectKey, IAssetStorageService storage, CancellationToken ct)
    {
        await storage.DeleteAsync(objectKey, ct);
        return Results.NoContent();
    }

    private static async Task<IResult> ReplaceAsync(string objectKey, HttpRequest request, IAssetStorageService storage, CancellationToken ct)
    {
        if (!request.HasFormContentType)
        {
            return Results.BadRequest(new { error = "multipart/form-data required" });
        }

        var form = await request.ReadFormAsync(ct);
        var file = form.Files.FirstOrDefault();
        if (file is null)
        {
            return Results.BadRequest(new { error = "file is required" });
        }

        await storage.DeleteAsync(objectKey, ct);
        await using var stream = file.OpenReadStream();
        var isPublic = bool.TryParse(form["isPublic"].FirstOrDefault(), out var parsed) && parsed;
        var result = await storage.UploadAsync(stream, objectKey, file.ContentType ?? "application/octet-stream", isPublic, ct);

        return Results.Ok(result);
    }

    private static IResult GetSignedUrl(string objectKey, IAssetStorageService storage)
    {
        return Results.Ok(new { url = storage.GetSignedReadUrl(objectKey, TimeSpan.FromHours(1)) });
    }
}
