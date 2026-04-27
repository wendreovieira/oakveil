using System.Text.Json;
using MediatR;
using Oakveil.Backend.Application.Common;
using Oakveil.Backend.Domain.Repositories;

namespace Oakveil.Backend.Application.Definitions.Commands;

public sealed record CreateDefinitionCommand(string DefinitionType, JsonElement Payload, string? Actor) : IRequest<DefinitionRecordDto>;

public sealed class CreateDefinitionCommandHandler : IRequestHandler<CreateDefinitionCommand, DefinitionRecordDto>
{
    private readonly IDefinitionRepository _repository;

    public CreateDefinitionCommandHandler(IDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<DefinitionRecordDto> Handle(CreateDefinitionCommand request, CancellationToken cancellationToken)
    {
        var created = await _repository.CreateAsync(request.DefinitionType, request.Payload.GetRawText(), request.Actor, cancellationToken);
        return DefinitionDtoMapper.Map(created);
    }
}
