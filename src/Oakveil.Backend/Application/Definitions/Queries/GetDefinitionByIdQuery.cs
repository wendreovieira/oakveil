using MediatR;
using Oakveil.Backend.Application.Common;
using Oakveil.Backend.Domain.Repositories;

namespace Oakveil.Backend.Application.Definitions.Queries;

public sealed record GetDefinitionByIdQuery(string DefinitionType, Guid Id, bool IncludeDeleted = false) : IRequest<DefinitionRecordDto?>;

public sealed class GetDefinitionByIdQueryHandler : IRequestHandler<GetDefinitionByIdQuery, DefinitionRecordDto?>
{
    private readonly IDefinitionRepository _repository;

    public GetDefinitionByIdQueryHandler(IDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<DefinitionRecordDto?> Handle(GetDefinitionByIdQuery request, CancellationToken cancellationToken)
    {
        var record = await _repository.GetByIdAsync(request.DefinitionType, request.Id, cancellationToken);
        if (record is null || (record.IsDeleted && !request.IncludeDeleted))
        {
            return null;
        }

        return DefinitionDtoMapper.Map(record);
    }
}
