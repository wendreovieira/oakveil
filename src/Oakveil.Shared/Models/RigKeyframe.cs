using System.Numerics;

namespace Oakveil.Shared.Models;

public class RigKeyframe
{
    public int TimeMs { get; set; }

    public Vector2? Position { get; set; }

    public float? Rotation { get; set; }

    public Vector2? Scale { get; set; }

    public Guid? UvVariantId { get; set; }

    public string? Event { get; set; }
}