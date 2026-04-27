namespace Oakveil.Shared.Definitions;

public class CharacterRigDefinition : DefinitionBase
{
    public List<Guid> RequiredSlotIds { get; set; } = [];
    public List<Guid> OptionalSlotIds { get; set; } = [];
}