package com.korainc.conformia_api.mapper;

import com.korainc.conformia_api.dto.EspelhoPontoResponse;
import com.korainc.conformia_api.entity.EspelhoPonto;
import org.springframework.stereotype.Component;

@Component
public class EspelhoPontoMapper {

    public EspelhoPontoResponse toResponse(EspelhoPonto e) {
        return new EspelhoPontoResponse(
                e.getId(),
                e.getFuncionario().getId(),
                e.getFuncionario().getNome(),
                e.getFuncionario().getDepartamento() != null
                        ? e.getFuncionario().getDepartamento().getNome()
                        : null,
                e.getAno(),
                e.getMes(),
                e.getDiasUteis(),
                e.getHorasPrevistasMinutos(),
                e.getHorasTrabalhadasMinutos(),
                e.getSaldoMinutos(),
                e.getHorasExtrasMinutos(),
                e.getHorasFaltantesMinutos(),
                formatar(e.getSaldoMinutos()),
                e.getClassificacao(),
                e.getOrigem(),
                e.getAtualizadoEm()
        );
    }

    private String formatar(int minutos) {
        int abs = Math.abs(minutos);
        String hhmm = String.format("%02d:%02d", abs / 60, abs % 60);
        return minutos < 0 ? "-" + hhmm : hhmm;
    }
}
