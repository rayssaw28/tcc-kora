package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.UfBrasil;

public record DocumentosPessoaisResponse(
        String cpf,
        String ctpsNumero,
        String ctpsSerie,
        UfBrasil ctpsUfEmissor,
        String pis,
        Boolean ctpsDigital
) {
}
