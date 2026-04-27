using Oakveil.Shared.Models;

namespace Oakveil.Shared.Definitions;

public class SkinDefinition : DefinitionBase
{
    public Guid SlotId { get; set; }
    public bool EastWestMirrored { get; set; } = true;
    public bool NorthInvisible { get; set; }
    public SkinDirection South { get; set; } = new();
    public SkinDirection North { get; set; } = new();
    public SkinDirection East { get; set; } = new();
    public SkinDirection West { get; set; } = new();
    public List<string> Tags { get; set; } = [];
}