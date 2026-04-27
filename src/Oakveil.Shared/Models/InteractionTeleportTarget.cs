namespace Oakveil.Shared.Models;

public sealed class InteractionTeleportTarget
{
    public required string MapId { get; set; }

    public float X { get; set; }
    public float Y { get; set; }
}