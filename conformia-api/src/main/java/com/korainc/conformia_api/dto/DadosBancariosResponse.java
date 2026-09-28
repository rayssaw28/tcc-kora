package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.TipoContaBancaria;

public record DadosBancariosResponse(
        Long id,
        String banco,
        TipoContaBancaria tipoConta,
        String agencia,
        String conta,
        String chavePix
) {
}
