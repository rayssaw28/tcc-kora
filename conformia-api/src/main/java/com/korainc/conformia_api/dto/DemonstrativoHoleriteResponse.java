package com.korainc.conformia_api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DemonstrativoHoleriteResponse(
        Long funcionarioId,
        String funcionarioNome,
        String departamentoNome,
        String cargoNome,
        int mes,
        int ano,
        BigDecimal salarioBase,
        BigDecimal comissao,
        BigDecimal adicionalInsalubridade,
        BigDecimal adicionalPericulosidade,
        BigDecimal adicionalNoturno,
        BigDecimal horaExtra,
        BigDecimal salarioBruto,
        BigDecimal descontoInss,
        int qtdDiasFalta,
        List<LocalDate> diasFalta,
        BigDecimal descontoFaltas,
        BigDecimal descontoIrrf,
        BigDecimal salarioLiquido,
        BigDecimal fgts,
        String resumoCalculo,
        String alertaPrincipal,
        HoleriteResponse arquivo
) {
}
