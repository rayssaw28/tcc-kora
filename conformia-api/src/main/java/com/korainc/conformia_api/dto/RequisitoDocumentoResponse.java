package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.TipoDocumento;

public record RequisitoDocumentoResponse(
        Long id,
        String titulo,
        TipoDocumento tipo,
        String descricao
) {
}
