package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.StatusDocumento;
import com.korainc.conformia_api.enums.TipoDocumento;

import java.time.OffsetDateTime;

public record DocumentoResponse(
        Long id,
        Long funcionarioId,
        Long requisitoId,
        TipoDocumento tipo,
        String tituloPersonalizado,
        String nomeArquivo,
        String contentType,
        long tamanhoBytes,
        StatusDocumento status,
        String motivoReprovacao,
        OffsetDateTime criadoEm
) {
}
