package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.ClassificacaoSaldo;

import java.time.OffsetDateTime;

public record EspelhoPontoResponse(
        Long id,
        Long funcionarioId,
        String funcionarioNome,
        String departamentoNome,
        int ano,
        int mes,
        Integer diasUteis,
        int horasPrevistasMinutos,
        int horasTrabalhadasMinutos,
        int saldoMinutos,
        int horasExtrasMinutos,
        int horasFaltantesMinutos,
        String saldoFormatado,
        ClassificacaoSaldo classificacao,
        String origem,
        OffsetDateTime atualizadoEm
) {
}
