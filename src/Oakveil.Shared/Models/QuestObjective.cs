using Oakveil.Shared.Enums;

namespace Oakveil.Shared.Models;

public sealed class QuestObjective
{
    public required string Id { get; set; }

    public QuestObjectiveType Type { get; set; }

    public string? TargetId { get; set; }

    public int RequiredAmount { get; set; } = 1;
}