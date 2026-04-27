using System.Drawing;
using System.Numerics;
using Oakveil.Shared.Models;

namespace Oakveil.Shared.Definitions;

public class UvDefinition : DefinitionBase
{
    /// <summary>
    /// Região base no atlas
    /// </summary>
    public Rectangle SourceRect { get; set; }

    /// <summary>
    /// Pivot para rotação/animação
    /// </summary>
    public Vector2 Pivot { get; set; }

    /// <summary>
    /// Frames para animação UV
    /// </summary>
    public List<UvFrame> Frames { get; set; } = new();
}