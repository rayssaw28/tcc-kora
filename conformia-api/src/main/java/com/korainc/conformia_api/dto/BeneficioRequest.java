package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.TipoBeneficio;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record BeneficioRequest(

        @NotNull(message = "O tipo do benefício é obrigatório.")
        TipoBeneficio tipo,

        @DecimalMin(value = "0.0", message = "O valor não pode ser negativo.")
        BigDecimal valor,

        @Size(max = 255, message = "A descrição deve ter no máximo 255 caracteres.")
        String descricao
) {
}
