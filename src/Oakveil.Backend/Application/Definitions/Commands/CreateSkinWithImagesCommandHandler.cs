using System.Text.Json;
using MediatR;
using Oakveil.Backend.Application.Common;
using Oakveil.Backend.Domain.Repositories;
using Oakveil.Backend.Domain.Services;
using Oakveil.Shared.Models;

namespace Oakveil.Backend.Application.Definitions.Commands;

public sealed class CreateSkinWithImagesCommandHandler : IRequestHandler<CreateSkinWithImagesCommand, DefinitionRecordDto>
{
    private readonly IDefinitionRepository _repository;
    private readonly IAssetStorageService _storage;

    public CreateSkinWithImagesCommandHandler(IDefinitionRepository repository, IAssetStorageService storage)
    {
        _repository = repository;
        _storage = storage;
    }

    public async Task<DefinitionRecordDto> Handle(CreateSkinWithImagesCommand request, CancellationToken cancellationToken)
    {
        var directionsToCreate = new Dictionary<string, SkinDirection>();
        var uploadedTextures = new Dictionary<string, Guid>();

        // Upload each direction's image and create TextureDefinition
        foreach (var (direction, file) in request.DirectionFiles)
        {
            if (file == null || file.Length == 0)
                continue;

            // Generate TextureDefinition key: filename + guid
            var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(file.FileName);
            var extension = Path.GetExtension(file.FileName);
            var textureKey = $"{fileNameWithoutExtension}_{Guid.NewGuid():N}";

            // Upload file to S3
            var objectKey = $"skins/{Guid.NewGuid():N}{extension}";
            await using var stream = file.OpenReadStream();
            var uploadResult = await _storage.UploadAsync(
                stream,
                objectKey,
                file.ContentType ?? "application/octet-stream",
                isPublic: true,
                cancellationToken
            );

            // Create TextureDefinition
            var texturePayload = JsonSerializer.Serialize(new
            {
                key = textureKey,
                path = uploadResult.ObjectKey,
                pixelPerfect = true,
                tags = new List<string>()
            });

            var texture = await _repository.CreateAsync("texture", texturePayload, request.Actor, cancellationToken);
            uploadedTextures[direction] = texture.Id;
        }

        // Build skin directions with uploaded texture IDs and UV IDs
        var directions = new[] { "south", "north", "east", "west" };
        foreach (var direction in directions)
        {
            // Skip directions that shouldn't have textures
            if (direction == "north" && request.NorthInvisible)
                continue;
            if (direction == "west" && request.EastWestMirrored)
                continue;

            if (!uploadedTextures.TryGetValue(direction, out var textureId))
                continue;

            var uvId = request.DirectionUvIds?.TryGetValue(direction, out var uvValue) == true
                ? uvValue
                : null;

            directionsToCreate[direction] = new SkinDirection
            {
                TextureId = textureId,
                UvId = string.IsNullOrEmpty(uvId) ? Guid.Empty : Guid.Parse(uvId)
            };
        }

        // Create SkinDefinition with all the texture references
        var skinKey = request.Key?.Trim() ?? $"skin_{Guid.NewGuid():N}";
        var skinPayload = JsonSerializer.Serialize(new
        {
            key = skinKey,
            slotId = Guid.Parse(request.SlotId),
            eastWestMirrored = request.EastWestMirrored,
            northInvisible = request.NorthInvisible,
            tags = request.Tags ?? new List<string>(),
            south = directionsToCreate.TryGetValue("south", out var s) ? new { s.TextureId, s.UvId } : null,
            north = directionsToCreate.TryGetValue("north", out var n) ? new { n.TextureId, n.UvId } : null,
            east = directionsToCreate.TryGetValue("east", out var e) ? new { e.TextureId, e.UvId } : null,
            west = directionsToCreate.TryGetValue("west", out var w) ? new { w.TextureId, w.UvId } : null
        });

        var created = await _repository.CreateAsync("skin", skinPayload, request.Actor, cancellationToken);
        return DefinitionDtoMapper.Map(created);
    }
}
