using FluentValidation;
using Oakveil.Backend.Application.Definitions.Commands;

namespace Oakveil.Backend.Application.Definitions.Validators;

public sealed class UpdateDefinitionCommandValidator : AbstractValidator<UpdateDefinitionCommand>
{
    public UpdateDefinitionCommandValidator()
    {
        RuleFor(x => x.DefinitionType)
            .NotEmpty()
            .Must(DefinitionTypeRegistry.IsKnown)
            .WithMessage("Unknown definition type.");

        RuleFor(x => x.Id).NotEmpty();

        RuleFor(x => x.Payload.ValueKind)
            .Equal(System.Text.Json.JsonValueKind.Object)
            .WithMessage("Payload must be a JSON object.");

        RuleFor(x => x)
            .Must(x => DefinitionPayloadInspector.GetMissingRequiredProperties(x.DefinitionType, x.Payload).Count == 0)
            .WithMessage(x => $"Missing required properties: {string.Join(", ", DefinitionPayloadInspector.GetMissingRequiredProperties(x.DefinitionType, x.Payload))}");
    }
}
