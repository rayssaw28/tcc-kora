package com.korainc.conformia_api.mapper;

import com.korainc.conformia_api.dto.AtestadoResponse;
import com.korainc.conformia_api.entity.Atestado;
import org.springframework.stereotype.Component;

import java.time.temporal.ChronoUnit;

@Component
public class AtestadoMapper {

    public AtestadoResponse toResponse(Atestado a) {
        long dias = ChronoUnit.DAYS.between(a.getDataInicio(), a.getDataFim()) + 1;
        return new AtestadoResponse(
                a.getId(),
                a.getFuncionario().getId(),
                a.getFuncionario().getNome(),
                a.getFuncionario().getCargo() != null
                        ? a.getFuncionario().getCargo().getNome()
                        : null,
                a.getFuncionario().getDepartamento() != null
                        ? a.getFuncionario().getDepartamento().getNome()
                        : null,
                a.getDataInicio(),
                a.getDataFim(),
                dias,
                a.getObservacao(),
                a.getStatus(),
                a.getNomeArquivo(),
                a.getContentType(),
                a.getTamanhoBytes(),
                a.getMotivoReprovacao(),
                a.getCriadoEm()
        );
    }
}
