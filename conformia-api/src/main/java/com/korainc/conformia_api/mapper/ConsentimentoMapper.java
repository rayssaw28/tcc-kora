package com.korainc.conformia_api.mapper;

import com.korainc.conformia_api.dto.ConsentimentoResponse;
import com.korainc.conformia_api.entity.ConsentimentoLgpd;
import org.springframework.stereotype.Component;

@Component
public class ConsentimentoMapper {

    public ConsentimentoResponse toResponse(ConsentimentoLgpd c) {
        return new ConsentimentoResponse(
                c.getId(),
                c.getFuncionario().getId(),
                c.getVersaoTermo(),
                c.getUrlTermo(),
                c.isAceito(),
                c.getRegistradoEm()
        );
    }
}
