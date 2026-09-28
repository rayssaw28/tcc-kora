package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.StatusAvaliacao;

import java.time.OffsetDateTime;
import java.util.List;

public record AvaliacaoResponse(
        Long id,
        Long avaliadoId,
        String avaliadoNome,
        Long avaliadorId,
        String avaliadorNome,
        String periodo,
        String comentarioGeral,
        Double notaFinal,
        StatusAvaliacao status,
        List<AvaliacaoItemResponse> itens,
        OffsetDateTime criadoEm,
        OffsetDateTime atualizadoEm
) {
}
