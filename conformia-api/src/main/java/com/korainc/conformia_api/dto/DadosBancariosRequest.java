package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.TipoContaBancaria;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DadosBancariosRequest(
        @NotBlank(message = "O banco e obrigatorio.")
        @Size(max = 120, message = "O banco deve ter no maximo 120 caracteres.")
        String banco,

        @NotNull(message = "O tipo de conta e obrigatorio.")
        TipoContaBancaria tipoConta,

        @NotBlank(message = "A agencia e obrigatoria.")
        @Size(max = 20, message = "A agencia deve ter no maximo 20 caracteres.")
        String agencia,

        @NotBlank(message = "A conta e obrigatoria.")
        @Size(max = 30, message = "A conta deve ter no maximo 30 caracteres.")
        String conta,

        @NotBlank(message = "A chave Pix e obrigatoria.")
        @Size(max = 180, message = "A chave Pix deve ter no maximo 180 caracteres.")
        String chavePix
) {
}
