package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.Perfil;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record FuncionarioPreAdmissaoRequest(

        @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 180, message = "O nome deve ter no máximo 180 caracteres.")
        String nome,

        @NotBlank(message = "O CPF é obrigatório.")
        @Pattern(regexp = "\\d{11}", message = "O CPF deve conter exatamente 11 dígitos.")
        String cpf,

        @NotBlank(message = "O e-mail é obrigatório.")
        @Email(message = "E-mail inválido.")
        String email,

        @NotBlank(message = "A senha temporária é obrigatória.")
        @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres.")
        String senha,

        @jakarta.validation.constraints.NotNull(message = "O perfil é obrigatório.")
        Perfil perfil,

        @jakarta.validation.constraints.NotNull(message = "O departamento é obrigatório.")
        Long departamentoId,

        @jakarta.validation.constraints.NotNull(message = "O cargo é obrigatório.")
        Long cargoId,

        @jakarta.validation.constraints.NotNull(message = "O líder direto é obrigatório.")
        Long gestorId
) {
}
