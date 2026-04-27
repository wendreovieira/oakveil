namespace Oakveil.Shared.Models;

public sealed class QuestReward
{
    public string? ItemDefinitionId { get; set; }
    public int Amount { get; set; }

    public int Gold { get; set; }

    public int Experience { get; set; }

    public List<SkillExperienceReward> SkillExperienceRewards { get; set; } = [];

    public List<string> UnlockQuestDefinitionIds { get; set; } = [];

    public List<string> UnlockInteractionDefinitionIds { get; set; } = [];
}