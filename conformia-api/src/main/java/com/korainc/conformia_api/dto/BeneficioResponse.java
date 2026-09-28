package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.TipoBeneficio;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record BeneficioResponse(
        Long id,
        Long funcionarioId,
        TipoBeneficio tipo,
        BigDecimal valor,
        String descricao,
        OffsetDateTime criadoEm
) {
}
