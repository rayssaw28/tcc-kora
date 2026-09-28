package com.korainc.conformia_api.service;

import com.korainc.conformia_api.enums.ClassificacaoSaldo;
import com.korainc.conformia_api.exception.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CalculoHorasTest {

    private final CalculoHoras calculoHoras = new CalculoHoras();

    @Test
    @DisplayName("Saldo positivo quando trabalhou mais que o previsto (horas extras)")
    void saldoPositivo() {
        CalculoHoras.Resultado r = calculoHoras.calcular(9600, 9750);

        assertEquals(150, r.saldoMinutos());
        assertEquals(150, r.extrasMinutos());
        assertEquals(0, r.faltantesMinutos());
        assertEquals(ClassificacaoSaldo.POSITIVO, r.classificacao());
    }

    @Test
    @DisplayName("Saldo negativo quando trabalhou menos que o previsto (horas faltantes)")
    void saldoNegativo() {
        CalculoHoras.Resultado r = calculoHoras.calcular(9600, 9480);

        assertEquals(-120, r.saldoMinutos());
        assertEquals(0, r.extrasMinutos());
        assertEquals(120, r.faltantesMinutos());
        assertEquals(ClassificacaoSaldo.NEGATIVO, r.classificacao());
    }

    @Test
    @DisplayName("Saldo neutro quando trabalhou exatamente o previsto")
    void saldoNeutro() {
        CalculoHoras.Resultado r = calculoHoras.calcular(9600, 9600);

        assertEquals(0, r.saldoMinutos());
        assertEquals(0, r.extrasMinutos());
        assertEquals(0, r.faltantesMinutos());
        assertEquals(ClassificacaoSaldo.NEUTRO, r.classificacao());
    }

    @Test
    @DisplayName("Lança exceção quando alguma das horas é negativa")
    void horasNegativasLancamExcecao() {
        assertThrows(BusinessException.class, () -> calculoHoras.calcular(-1, 100));
        assertThrows(BusinessException.class, () -> calculoHoras.calcular(100, -1));
    }
}
