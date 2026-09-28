package com.korainc.conformia_api.dto;

import java.time.OffsetDateTime;

public record ConsentimentoResponse(
        Long id,
        Long funcionarioId,
        String versaoTermo,
        String urlTermo,
        boolean aceito,
        OffsetDateTime registradoEm
) {
}
