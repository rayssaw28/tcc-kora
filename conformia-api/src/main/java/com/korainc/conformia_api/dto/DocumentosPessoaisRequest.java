package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.UfBrasil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DocumentosPessoaisRequest(
        @NotBlank(message = "O CPF e obrigatorio.")
        @Pattern(regexp = "\\d{11}", message = "O CPF deve conter 11 digitos.")
        String cpf,

        @NotBlank(message = "O numero da carteira de trabalho e obrigatorio.")
        @Size(max = 30, message = "O numero da carteira deve ter no maximo 30 caracteres.")
        String ctpsNumero,

        @NotBlank(message = "A serie da carteira de trabalho e obrigatoria.")
        @Size(max = 20, message = "A serie deve ter no maximo 20 caracteres.")
        String ctpsSerie,

        @NotNull(message = "A UF emissora e obrigatoria.")
        UfBrasil ctpsUfEmissor,

        @NotBlank(message = "O PIS e obrigatorio.")
        @Pattern(regexp = "\\d{11}", message = "O PIS deve conter 11 digitos.")
        String pis,

        @NotNull(message = "Informe se a CTPS e digital.")
        Boolean ctpsDigital
) {
}
