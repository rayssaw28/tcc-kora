package com.korainc.conformia_api.dto;

public record AvaliacaoItemResponse(
        Long id,
        String criterio,
        int nota,
        String comentario
) {
}
