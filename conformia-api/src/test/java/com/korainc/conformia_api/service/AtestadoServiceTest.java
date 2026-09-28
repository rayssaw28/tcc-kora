package com.korainc.conformia_api.service;

import com.korainc.conformia_api.exception.BusinessException;
import com.korainc.conformia_api.infrastructure.FileStorageService;
import com.korainc.conformia_api.mapper.AtestadoMapper;
import com.korainc.conformia_api.repository.AtestadoRepository;
import com.korainc.conformia_api.repository.FuncionarioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class AtestadoServiceTest {

    @Mock
    private AtestadoRepository repository;
    @Mock
    private FuncionarioRepository funcionarioRepository;
    @Mock
    private FileStorageService storage;
    @Mock
    private AtestadoMapper mapper;

    @InjectMocks
    private AtestadoService service;

    @Test
    @DisplayName("RF10: data fim anterior ao início é rejeitada (sem gravar arquivo)")
    void dataFimAntesDoInicio() {
        assertThrows(BusinessException.class, () ->
                service.enviar(1L, null, LocalDate.of(2026, 5, 12), LocalDate.of(2026, 5, 10), "x"));

        verifyNoInteractions(storage, repository);
    }

}
