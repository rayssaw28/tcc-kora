package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.StatusDocumento;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record AtestadoResponse(
        Long id,
        Long funcionarioId,
        String funcionarioNome,
        String cargoNome,
        String departamentoNome,
        LocalDate dataInicio,
        LocalDate dataFim,
        long diasCobertos,
        String observacao,
        StatusDocumento status,
        String nomeArquivo,
        String contentType,
        long tamanhoBytes,
        String motivoReprovacao,
        OffsetDateTime criadoEm
) {
}
