using Oakveil.Shared.Enums;

namespace Oakveil.Shared.Models;

public sealed class StatModifier
{
    public StatType Stat { get; set; }
    public int FlatValue { get; set; }
    public float PercentValue { get; set; }
}