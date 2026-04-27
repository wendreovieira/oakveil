namespace Oakveil.Shared.Definitions;

public class SkinDefinition : DefinitionBase
{
    public Guid TextureId { get; set; }
    public Guid UvId { get; set; }
    public List<Guid> CompatibleSlotIds { get; set; } = new();
}