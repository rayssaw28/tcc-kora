package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.EstadoCivil;
import com.korainc.conformia_api.enums.Genero;
import com.korainc.conformia_api.enums.UfBrasil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.Set;

public record FuncionarioAtualizacaoRequest(

        @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 180, message = "O nome deve ter no máximo 180 caracteres.")
        String nome,

        @NotBlank(message = "O telefone é obrigatório.")
        @Pattern(
                regexp = "(?:\\D*\\d){10,11}\\D*",
                message = "O telefone deve conter DDD e 10 ou 11 dígitos."
        )
        String telefone,

        @NotEmpty(message = "Informe ao menos uma nacionalidade.")
        Set<@Valid @NotBlank(message = "A nacionalidade não pode estar vazia.") String> nacionalidades,

        @NotNull(message = "A UF natal é obrigatória.")
        UfBrasil ufNatal,

        @NotBlank(message = "A cidade natal é obrigatória.")
        @Size(max = 120, message = "A cidade natal deve ter no máximo 120 caracteres.")
        String cidadeNatal,

        @NotNull(message = "O gênero é obrigatório.")
        Genero genero,

        @Size(max = 180, message = "O nome social deve ter no máximo 180 caracteres.")
        String nomeSocial,

        @NotNull(message = "O estado civil é obrigatório.")
        EstadoCivil estadoCivil,

        @NotNull(message = "A data de nascimento é obrigatória.")
        @Past(message = "A data de nascimento deve estar no passado.")
        LocalDate dataNascimento
) {
}
