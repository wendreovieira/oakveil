namespace Oakveil.Shared.Definitions;

public class AnimationDefinition : DefinitionBase
{
    public required Guid SkeletonId { get; set; }

    public List<int> Frames { get; set; } = new();

    public float FrameDuration { get; set; }

    public bool Loop { get; set; }
}