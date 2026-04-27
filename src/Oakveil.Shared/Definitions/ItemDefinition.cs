using Oakveil.Shared.Enums;
using Oakveil.Shared.Models;

namespace Oakveil.Shared.Definitions;

public class ItemDefinition : DefinitionBase
{
    public ItemType Type { get; set; }
    
    // Visuals
    public required SpriteRef Sprite { get; set; }
    public SpriteRef? WorldSprite { get; set; }
    public SpriteRef? EquippedSprite { get; set; }
    
    // Stack
    public bool Stackable { get; set; }
    public int MaxStack { get; set; } = 1;
    
    // Economy
    public bool Tradable { get; set; } = true;
    public bool Droppable { get; set; } = true;
    public bool Destroyable { get; set; } = true;
    public int Value { get; set; }
    
    // Consumable
    public bool IsConsumable { get; set; }

    // Tool usage
    public List<GatheringActionType> ToolActions { get; set; } = [];

    // Requirements
    public List<SkillRequirement> SkillRequirements { get; set; } = [];

    // Stat modifiers
    public List<StatModifier> StatModifiers { get; set; } = [];

    // Optional combat
    public int AttackRange { get; set; } = 1;
    public int AttackSpeedMs { get; set; } = 2400;
    
    // Optional metadata
    public Dictionary<string, string> Metadata { get; set; } = [];
}