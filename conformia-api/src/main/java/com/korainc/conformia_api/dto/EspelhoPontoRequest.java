package com.korainc.conformia_api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record EspelhoPontoRequest(

        @NotNull(message = "funcionarioId é obrigatório.")
        Long funcionarioId,

        @NotNull(message = "ano é obrigatório.")
        @Min(value = 1900, message = "ano inválido.")
        Integer ano,

        @NotNull(message = "mes é obrigatório.")
        @Min(value = 1, message = "mes deve estar entre 1 e 12.")
        @Max(value = 12, message = "mes deve estar entre 1 e 12.")
        Integer mes,

        @PositiveOrZero(message = "diasUteis não pode ser negativo.")
        Integer diasUteis,

        @NotNull(message = "horasPrevistasMinutos é obrigatório.")
        @PositiveOrZero(message = "horasPrevistasMinutos não pode ser negativo.")
        Integer horasPrevistasMinutos,

        @NotNull(message = "horasTrabalhadasMinutos é obrigatório.")
        @PositiveOrZero(message = "horasTrabalhadasMinutos não pode ser negativo.")
        Integer horasTrabalhadasMinutos,

        @Size(max = 120, message = "origem deve ter no máximo 120 caracteres.")
        String origem
) {
}
