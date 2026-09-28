package com.korainc.conformia_api.dto;

import java.time.OffsetDateTime;

public record HoleriteResponse(
        Long id,
        Long funcionarioId,
        String funcionarioNome,
        String departamentoNome,
        int mes,
        int ano,
        String nomeArquivo,
        String contentType,
        long tamanhoBytes,
        OffsetDateTime criadoEm
) {
}
