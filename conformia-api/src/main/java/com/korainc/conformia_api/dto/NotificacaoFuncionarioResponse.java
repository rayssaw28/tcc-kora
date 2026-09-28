package com.korainc.conformia_api.dto;

import java.time.OffsetDateTime;

public record NotificacaoFuncionarioResponse(
        Long id,
        String titulo,
        String descricao,
        String aba,
        OffsetDateTime criadoEm
) {
}
