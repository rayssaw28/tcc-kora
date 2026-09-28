package com.korainc.conformia_api.dto;

import java.time.OffsetDateTime;

public record DepartamentoResponse(
        Long id,
        String nome,
        String descricao,
        boolean ativo,
        OffsetDateTime criadoEm,
        OffsetDateTime atualizadoEm
) {
}
