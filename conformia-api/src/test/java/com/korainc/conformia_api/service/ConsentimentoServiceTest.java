package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.ConsentimentoResponse;
import com.korainc.conformia_api.entity.ConsentimentoLgpd;
import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.entity.TermoLgpd;
import com.korainc.conformia_api.exception.BusinessException;
import com.korainc.conformia_api.mapper.ConsentimentoMapper;
import com.korainc.conformia_api.repository.ConsentimentoLgpdRepository;
import com.korainc.conformia_api.entity.HistoricoAlteracaoFuncionario;
import com.korainc.conformia_api.repository.FuncionarioRepository;
import com.korainc.conformia_api.repository.HistoricoAlteracaoFuncionarioRepository;
import com.korainc.conformia_api.repository.TermoLgpdRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConsentimentoServiceTest {

    private static final Long FUNCIONARIO_ID = 7L;

    @Mock
    private ConsentimentoLgpdRepository repository;
    @Mock
    private FuncionarioRepository funcionarioRepository;
    @Mock
    private TermoLgpdRepository termoRepository;
    @Mock
    private HistoricoAlteracaoFuncionarioRepository historicoRepository;

    private ConsentimentoService service;
    private Funcionario funcionario;

    @BeforeEach
    void setUp() {
        service = new ConsentimentoService(repository, funcionarioRepository, termoRepository,
                historicoRepository, new ConsentimentoMapper());
        funcionario = Funcionario.builder().build();
        funcionario.setId(FUNCIONARIO_ID);
        when(funcionarioRepository.findById(FUNCIONARIO_ID)).thenReturn(Optional.of(funcionario));
    }

    private ConsentimentoLgpd registro(boolean aceito, String versao) {
        return ConsentimentoLgpd.builder()
                .funcionario(funcionario)
                .versaoTermo(versao)
                .urlTermo("https://termos/" + versao)
                .aceito(aceito)
                .build();
    }

    @Test
    @DisplayName("Revogar grava novo registro aceito=false e preserva o aceite original")
    void revogarGravaNovoRegistro() {
        when(repository.findFirstByFuncionarioIdOrderByRegistradoEmDescIdDesc(FUNCIONARIO_ID))
                .thenReturn(Optional.of(registro(true, "1.0")));
        when(repository.save(any(ConsentimentoLgpd.class))).thenAnswer(i -> i.getArgument(0));

        ConsentimentoResponse resposta = service.revogar(FUNCIONARIO_ID, "10.0.0.1");

        ArgumentCaptor<ConsentimentoLgpd> captor = ArgumentCaptor.forClass(ConsentimentoLgpd.class);
        verify(repository).save(captor.capture());
        ConsentimentoLgpd salvo = captor.getValue();
        assertFalse(salvo.isAceito());
        assertEquals("1.0", salvo.getVersaoTermo());
        assertEquals("https://termos/1.0", salvo.getUrlTermo());
        assertEquals("10.0.0.1", salvo.getIpOrigem());
        assertFalse(resposta.aceito());
    }

    @Test
    @DisplayName("Revogar é idempotente quando o estado atual já é revogado")
    void revogarEhIdempotente() {
        ConsentimentoLgpd revogado = registro(false, "1.0");
        when(repository.findFirstByFuncionarioIdOrderByRegistradoEmDescIdDesc(FUNCIONARIO_ID))
                .thenReturn(Optional.of(revogado));

        ConsentimentoResponse resposta = service.revogar(FUNCIONARIO_ID, "10.0.0.1");

        verify(repository, never()).save(any());
        assertFalse(resposta.aceito());
    }

    @Test
    @DisplayName("Revogar sem nenhum consentimento registrado é recusado")
    void revogarSemConsentimentoLancaErro() {
        when(repository.findFirstByFuncionarioIdOrderByRegistradoEmDescIdDesc(FUNCIONARIO_ID))
                .thenReturn(Optional.empty());

        assertThrows(BusinessException.class, () -> service.revogar(FUNCIONARIO_ID, "10.0.0.1"));
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Revogação pelo ADMIN grava consentimento e registra o autor no histórico")
    void revogarPorAdminRegistraAutor() {
        when(repository.findFirstByFuncionarioIdOrderByRegistradoEmDescIdDesc(FUNCIONARIO_ID))
                .thenReturn(Optional.of(registro(true, "1.0")));
        when(repository.save(any(ConsentimentoLgpd.class))).thenAnswer(i -> i.getArgument(0));
        when(funcionarioRepository.getReferenceById(FUNCIONARIO_ID)).thenReturn(funcionario);

        ConsentimentoResponse resposta = service.revogarPorAdmin(FUNCIONARIO_ID, "10.0.0.1", 1L, "Admin RH");

        assertFalse(resposta.aceito());
        ArgumentCaptor<HistoricoAlteracaoFuncionario> captor =
                ArgumentCaptor.forClass(HistoricoAlteracaoFuncionario.class);
        verify(historicoRepository).save(captor.capture());
        assertEquals(1L, captor.getValue().getAlteradoPorId());
        assertEquals("Admin RH", captor.getValue().getAlteradoPorNome());
        assertEquals("Consentimento LGPD", captor.getValue().getCampo());
    }

    @Test
    @DisplayName("Revogação repetida pelo ADMIN não duplica registro nem histórico")
    void revogarPorAdminRepetidaNaoDuplica() {
        when(repository.findFirstByFuncionarioIdOrderByRegistradoEmDescIdDesc(FUNCIONARIO_ID))
                .thenReturn(Optional.of(registro(false, "1.0")));

        service.revogarPorAdmin(FUNCIONARIO_ID, "10.0.0.1", 1L, "Admin RH");

        verify(repository, never()).save(any());
        verify(historicoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Novo aceite após revogação gera novo registro (não reaproveita o aceite antigo)")
    void aceitarAposRevogacaoGeraNovoRegistro() {
        TermoLgpd termo = TermoLgpd.builder().versao("1.0").url("https://termos/1.0").build();
        when(termoRepository.findFirstByOrderByPublicadoEmDescIdDesc()).thenReturn(Optional.of(termo));
        when(repository.findFirstByFuncionarioIdOrderByRegistradoEmDescIdDesc(FUNCIONARIO_ID))
                .thenReturn(Optional.of(registro(false, "1.0")));
        when(repository.save(any(ConsentimentoLgpd.class))).thenAnswer(i -> i.getArgument(0));

        ConsentimentoResponse resposta = service.registrar(FUNCIONARIO_ID, "10.0.0.1");

        verify(repository).save(any(ConsentimentoLgpd.class));
        assertTrue(resposta.aceito());
    }

    @Test
    @DisplayName("Aceitar novamente o mesmo termo já aceito continua idempotente")
    void aceitarTermoJaAceitoEhIdempotente() {
        TermoLgpd termo = TermoLgpd.builder().versao("1.0").url("https://termos/1.0").build();
        ConsentimentoLgpd aceite = registro(true, "1.0");
        when(termoRepository.findFirstByOrderByPublicadoEmDescIdDesc()).thenReturn(Optional.of(termo));
        when(repository.findFirstByFuncionarioIdOrderByRegistradoEmDescIdDesc(FUNCIONARIO_ID))
                .thenReturn(Optional.of(aceite));

        service.registrar(FUNCIONARIO_ID, "10.0.0.1");

        verify(repository, never()).save(any());
    }
}
