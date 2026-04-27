using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text.Json;

namespace Oakveil.Backend.Application.Definitions;

public static class DefinitionPayloadInspector
{
    public static IReadOnlyCollection<string> GetMissingRequiredProperties(string definitionType, JsonElement payload)
    {
        if (payload.ValueKind != JsonValueKind.Object)
        {
            return ["payload must be a JSON object"];
        }

        var type = DefinitionTypeRegistry.Resolve(definitionType);
        var required = type
            .GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p.GetCustomAttribute<RequiredMemberAttribute>() is not null)
            .Select(p => p.Name)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (required.Length == 0)
        {
            return Array.Empty<string>();
        }

        var missing = new List<string>();
        foreach (var property in required)
        {
            if (!TryGetProperty(payload, property, out var value))
            {
                missing.Add(property);
                continue;
            }

            if (value.ValueKind == JsonValueKind.Null)
            {
                missing.Add(property);
                continue;
            }

            if (value.ValueKind == JsonValueKind.String && string.IsNullOrWhiteSpace(value.GetString()))
            {
                missing.Add(property);
            }
        }

        return missing;
    }

    private static bool TryGetProperty(JsonElement payload, string propertyName, out JsonElement value)
    {
        foreach (var prop in payload.EnumerateObject())
        {
            if (string.Equals(prop.Name, propertyName, StringComparison.OrdinalIgnoreCase))
            {
                value = prop.Value;
                return true;
            }
        }

        value = default;
        return false;
    }
}
