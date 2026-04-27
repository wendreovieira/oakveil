using Oakveil.Shared.Enums;

namespace Oakveil.Shared.Models;

public sealed class InteractionCondition
{
    public InteractionConditionType Type { get; set; }

    public string? Value { get; set; }

    public int IntValue { get; set; }

    public bool Negate { get; set; }
}