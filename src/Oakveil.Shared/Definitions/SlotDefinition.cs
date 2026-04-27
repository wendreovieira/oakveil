using System.Numerics;
using Oakveil.Shared.Enums;

namespace Oakveil.Shared.Definitions;

public class SlotDefinition : DefinitionBase
{
    public required Guid SkeletonId { get; set; }
    public SlotType Type { get; set; }
    public Guid? ParentSlotId { get; set; }
    public Vector2 LocalPosition { get; set; }
    public MirrorMode MirrorMode { get; set; }
    public AnimationMirrorMode AnimationMirrorMode { get; set; }
    public int ZIndex { get; set; }
    public List<Guid> CompatibleUvIds { get; set; } = new();
}