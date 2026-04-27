namespace Oakveil.Shared.Models;

public sealed class InteractionBranchOption
{
    public required string NextNodeId { get; set; }

    public int Priority { get; set; }

    public List<InteractionCondition> Conditions { get; set; } = [];
}