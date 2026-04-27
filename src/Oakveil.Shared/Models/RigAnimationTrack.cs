namespace Oakveil.Shared.Models;

public class RigAnimationTrack
{
    public Guid SlotId { get; set; }

    public List<RigKeyframe> Keyframes { get; set; } = [];
}