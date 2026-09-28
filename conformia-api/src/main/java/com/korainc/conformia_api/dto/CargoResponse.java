package com.korainc.conformia_api.dto;

import java.time.OffsetDateTime;

public record CargoResponse(
        Long id,
        String nome,
        String descricao,
        Long departamentoId,
        String departamentoNome,
        Long liderDiretoId,
        String liderDiretoNome,
        boolean ativo,
        OffsetDateTime criadoEm,
        OffsetDateTime atualizadoEm
) {
}
