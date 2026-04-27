using Oakveil.Shared.Models;

namespace Oakveil.Shared.Definitions;

public sealed class QuestDefinition : DefinitionBase
{
    public required string Name { get; set; }
    
    public string? Description { get; set; }

    public bool Repeatable { get; set; }

    public List<QuestObjective> Objectives { get; set; } = [];

    public List<QuestReward> Rewards { get; set; } = [];
}