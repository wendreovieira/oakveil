using MediatR;
using Oakveil.Backend.Application.Common;

namespace Oakveil.Backend.Application.Definitions.Commands;

public sealed record CreateSkinWithImagesCommand(
    string SlotId,
    Dictionary<string, IFormFile> DirectionFiles,
    Dictionary<string, string>? DirectionUvIds,
    bool EastWestMirrored,
    bool NorthInvisible,
    List<string>? Tags,
    string? Key,
    string? Actor
) : IRequest<DefinitionRecordDto>;
