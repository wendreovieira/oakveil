using Oakveil.Shared.Enums;

namespace Oakveil.Shared.Models;

public sealed class SkillExperienceReward
{
    public SkillType Skill { get; set; }

    public int Experience { get; set; }
}