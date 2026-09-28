package com.korainc.conformia_api.dto;

import java.time.OffsetDateTime;

public record TermoLgpdResponse(
        String versao,
        String url,
        OffsetDateTime atualizadoEm
) {
}
