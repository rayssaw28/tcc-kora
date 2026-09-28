package com.korainc.conformia_api.dto;

import java.time.OffsetDateTime;

public record HistoricoAlteracaoFuncionarioResponse(
        Long id,
        Long funcionarioId,
        Long alteradoPorId,
        String alteradoPorNome,
        String campo,
        String valorAnterior,
        String valorNovo,
        OffsetDateTime alteradoEm
) {
}
