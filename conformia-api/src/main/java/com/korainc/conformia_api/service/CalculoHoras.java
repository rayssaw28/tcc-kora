package com.korainc.conformia_api.service;

import com.korainc.conformia_api.enums.ClassificacaoSaldo;
import com.korainc.conformia_api.exception.BusinessException;
import org.springframework.stereotype.Component;

@Component
public class CalculoHoras {

    public Resultado calcular(int horasPrevistasMinutos, int horasTrabalhadasMinutos) {
        if (horasPrevistasMinutos < 0 || horasTrabalhadasMinutos < 0) {
            throw new BusinessException("Horas previstas e trabalhadas não podem ser negativas.");
        }

        int saldo = horasTrabalhadasMinutos - horasPrevistasMinutos;
        int extras = Math.max(saldo, 0);
        int faltantes = Math.max(-saldo, 0);

        ClassificacaoSaldo classificacao;
        if (saldo > 0) {
            classificacao = ClassificacaoSaldo.POSITIVO;
        } else if (saldo < 0) {
            classificacao = ClassificacaoSaldo.NEGATIVO;
        } else {
            classificacao = ClassificacaoSaldo.NEUTRO;
        }

        return new Resultado(saldo, extras, faltantes, classificacao);
    }

    public record Resultado(
            int saldoMinutos,
            int extrasMinutos,
            int faltantesMinutos,
            ClassificacaoSaldo classificacao
    ) {
    }
}
