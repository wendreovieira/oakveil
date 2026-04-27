namespace Oakveil.Shared.Models;

public sealed class InteractionChoiceOption
{
    public required string Id { get; set; }

    public required string TranslationId { get; set; }

    public required string NextNodeId { get; set; }

    public List<InteractionCondition> Conditions { get; set; } = [];
}