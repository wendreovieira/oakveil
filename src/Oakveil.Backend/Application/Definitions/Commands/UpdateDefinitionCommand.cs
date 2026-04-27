using System.Text.Json;
using MediatR;
using Oakveil.Backend.Application.Common;
using Oakveil.Backend.Domain.Repositories;

namespace Oakveil.Backend.Application.Definitions.Commands;

public sealed record UpdateDefinitionCommand(string DefinitionType, Guid Id, JsonElement Payload, string? Actor) : IRequest<DefinitionRecordDto?>;

public sealed class UpdateDefinitionCommandHandler : IRequestHandler<UpdateDefinitionCommand, DefinitionRecordDto?>
{
    private readonly IDefinitionRepository _repository;

    public UpdateDefinitionCommandHandler(IDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<DefinitionRecordDto?> Handle(UpdateDefinitionCommand request, CancellationToken cancellationToken)
    {
        var updated = await _repository.UpdateAsync(request.DefinitionType, request.Id, request.Payload.GetRawText(), request.Actor, cancellationToken);
        return updated is null ? null : DefinitionDtoMapper.Map(updated);
    }
}
