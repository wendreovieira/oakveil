using Oakveil.Shared.Definitions;

namespace Oakveil.Backend.Application.Definitions;

public static class DefinitionTypeRegistry
{
    private static readonly IReadOnlyDictionary<string, Type> TypesByName = BuildRegistry();

    public static IReadOnlyCollection<string> Names => TypesByName.Keys.ToArray();

    public static bool IsKnown(string definitionType) => TypesByName.ContainsKey(Normalize(definitionType));

    public static Type Resolve(string definitionType)
    {
        var key = Normalize(definitionType);
        if (!TypesByName.TryGetValue(key, out var type))
        {
            throw new InvalidOperationException($"Unknown definition type '{definitionType}'.");
        }

        return type;
    }

    private static IReadOnlyDictionary<string, Type> BuildRegistry()
    {
        var types = typeof(DefinitionBase)
            .Assembly
            .GetTypes()
            .Where(t => t is { IsAbstract: false, IsClass: true } && typeof(DefinitionBase).IsAssignableFrom(t));

        return types.ToDictionary(t => Normalize(t.Name), t => t, StringComparer.OrdinalIgnoreCase);
    }

    private static string Normalize(string value)
    {
        var normalized = value.Trim().ToLowerInvariant();
        return normalized.EndsWith("definition", StringComparison.Ordinal)
            ? normalized[..^"definition".Length]
            : normalized;
    }
}
