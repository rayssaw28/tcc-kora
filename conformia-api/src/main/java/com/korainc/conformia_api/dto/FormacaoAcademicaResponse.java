package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.Escolaridade;

public record FormacaoAcademicaResponse(
        Long id,
        Escolaridade escolaridade,
        String instituicaoEnsino,
        String curso,
        Integer anoConclusao
) {
}
