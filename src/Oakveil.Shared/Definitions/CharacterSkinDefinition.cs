using Oakveil.Shared.Models;

namespace Oakveil.Shared.Definitions;

public class CharacterSkinDefinition : DefinitionBase
{
    public List<CharacterSkinPart> Parts { get; set; } = new();
}