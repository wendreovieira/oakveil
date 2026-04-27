using Oakveil.Shared.Models;

namespace Oakveil.Shared.Definitions;

public class RigAnimationDefinition : DefinitionBase
{
    public required Guid SkeletonId { get; set; }

    public bool Loop { get; set; }

    public int DurationMs { get; set; }

    public List<RigAnimationTrack> Tracks { get; set; } = [];
}