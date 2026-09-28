package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.Escolaridade;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FormacaoAcademicaItemRequest(
        @NotNull(message = "A escolaridade e obrigatoria.")
        Escolaridade escolaridade,

        @NotBlank(message = "A instituicao de ensino e obrigatoria.")
        @Size(max = 180, message = "A instituicao deve ter no maximo 180 caracteres.")
        String instituicaoEnsino,

        @NotBlank(message = "O curso e obrigatorio.")
        @Size(max = 180, message = "O curso deve ter no maximo 180 caracteres.")
        String curso,

        @NotNull(message = "O ano de conclusao e obrigatorio.")
        @Min(value = 1900, message = "O ano de conclusao deve ser igual ou posterior a 1900.")
        @Max(value = 2200, message = "O ano de conclusao deve ser igual ou anterior a 2200.")
        Integer anoConclusao
) {
}
