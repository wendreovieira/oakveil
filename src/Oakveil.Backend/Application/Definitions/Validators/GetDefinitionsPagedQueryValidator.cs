using FluentValidation;
using Oakveil.Backend.Application.Definitions.Queries;

namespace Oakveil.Backend.Application.Definitions.Validators;

public sealed class GetDefinitionsPagedQueryValidator : AbstractValidator<GetDefinitionsPagedQuery>
{
    public GetDefinitionsPagedQueryValidator()
    {
        RuleFor(x => x.DefinitionType)
            .NotEmpty()
            .Must(DefinitionTypeRegistry.IsKnown)
            .WithMessage("Unknown definition type.");

        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 200);
    }
}
