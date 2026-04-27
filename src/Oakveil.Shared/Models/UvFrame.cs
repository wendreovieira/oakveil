using System.Drawing;
using System.Numerics;

namespace Oakveil.Shared.Models;

public class UvFrame
{
    public Rectangle SourceRect { get; set; }

    public float Duration { get; set; }

    public Vector2 Offset { get; set; }
}