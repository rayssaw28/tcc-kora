package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.FuncionarioPreAdmissaoRequest;
import com.korainc.conformia_api.dto.FuncionarioProfissionalRequest;
import com.korainc.conformia_api.entity.Cargo;
import com.korainc.conformia_api.entity.Departamento;
import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.entity.HistoricoAlteracaoFuncionario;
import com.korainc.conformia_api.entity.RequisitoDocumento;
import com.korainc.conformia_api.enums.Perfil;
import com.korainc.conformia_api.enums.StatusAdmissao;
import com.korainc.conformia_api.enums.StatusDocumento;
import com.korainc.conformia_api.exception.BusinessException;
import com.korainc.conformia_api.mapper.FuncionarioMapper;
import com.korainc.conformia_api.repository.CargoRepository;
import com.korainc.conformia_api.repository.DadosBancariosRepository;
import com.korainc.conformia_api.repository.DepartamentoRepository;
import com.korainc.conformia_api.repository.DocumentoRepository;
import com.korainc.conformia_api.repository.FuncionarioRepository;
import com.korainc.conformia_api.repository.HistoricoAlteracaoFuncionarioRepository;
import com.korainc.conformia_api.repository.RequisitoDocumentoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FuncionarioServiceTest {

    @Mock
    private FuncionarioRepository funcionarioRepository;
    @Mock
    private DepartamentoRepository departamentoRepository;
    @Mock
    private CargoRepository cargoRepository;
    @Mock
    private FuncionarioMapper mapper;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private EscopoService escopoService;
    @Mock
    private DocumentoRepository documentoRepository;
    @Mock
    private RequisitoDocumentoRepository requisitoDocumentoRepository;
    @Mock
    private DadosBancariosRepository dadosBancariosRepository;
    @Mock
    private HistoricoAlteracaoFuncionarioRepository historicoRepository;

    @InjectMocks
    private FuncionarioService service;

    private RequisitoDocumento requisito(Long id, String titulo) {
        RequisitoDocumento requisito = RequisitoDocumento.builder().titulo(titulo).build();
        requisito.setId(id);
        return requisito;
    }

    @Test
    @DisplayName("Conta operacional: cadastro de colaborador com perfil ADMIN e bloqueado")
    void cadastrarColaboradorAdminFalha() {
        FuncionarioPreAdmissaoRequest request = new FuncionarioPreAdmissaoRequest(
                "Administrador indevido",
                "12345678901",
                "admin-indev@korainc.com.br",
                "123456",
                Perfil.ADMIN,
                null,
                null,
                null
        );

        assertThrows(BusinessException.class, () -> service.cadastrarPreAdmissao(request));
    }

    @Test
    @DisplayName("Estrutura: cargo deve pertencer ao departamento informado")
    void atualizarComCargoDeOutroDepartamentoFalha() {
        Departamento departamentoSelecionado = Departamento.builder().nome("Tecnologia").build();
        departamentoSelecionado.setId(10L);
        Departamento departamentoDoCargo = Departamento.builder().nome("Pessoas").build();
        departamentoDoCargo.setId(20L);
        Cargo cargo = Cargo.builder()
                .nome("Analista de RH")
                .departamento(departamentoDoCargo)
                .build();
        cargo.setId(30L);
        Funcionario funcionario = Funcionario.builder()
                .perfil(Perfil.FUNCIONARIO)
                .build();
        funcionario.setId(1L);

        when(funcionarioRepository.findById(1L)).thenReturn(Optional.of(funcionario));
        when(departamentoRepository.findById(10L)).thenReturn(Optional.of(departamentoSelecionado));
        when(cargoRepository.findById(30L)).thenReturn(Optional.of(cargo));

        FuncionarioProfissionalRequest request = new FuncionarioProfissionalRequest(
                Perfil.FUNCIONARIO,
                10L,
                30L,
                null
        );

        assertThrows(BusinessException.class,
                () -> service.atualizarDadosProfissionais(1L, request, 10L, "RH"));
    }

    @Test
    @DisplayName("RN03: submeter sem telefone/data de nascimento é bloqueado")
    void submeterSemDadosPessoaisFalha() {
        Funcionario f = Funcionario.builder().statusAdmissao(StatusAdmissao.PRE_ADMISSAO).build();
        when(funcionarioRepository.findById(1L)).thenReturn(Optional.of(f));

        assertThrows(BusinessException.class, () -> service.submeterPreAdmissao(1L));
        assertEquals(StatusAdmissao.PRE_ADMISSAO, f.getStatusAdmissao());
    }

    @Test
    @DisplayName("RN03: submeter com dados completos vai para AGUARDANDO_APROVACAO")
    void submeterCompletoTransiciona() {
        Funcionario f = Funcionario.builder()
                .statusAdmissao(StatusAdmissao.PRE_ADMISSAO)
                .telefone("62999990000")
                .dataNascimento(LocalDate.of(1995, 4, 10))
                .build();
        f.setId(1L);
        when(funcionarioRepository.findById(1L)).thenReturn(Optional.of(f));
        when(dadosBancariosRepository.existsByFuncionarioId(1L)).thenReturn(true);
        when(requisitoDocumentoRepository.findAll())
                .thenReturn(List.of(requisito(10L, "CPF"), requisito(11L, "CTPS")));
        when(documentoRepository.existsByFuncionarioIdAndRequisitoId(1L, 10L)).thenReturn(true);
        when(documentoRepository.existsByFuncionarioIdAndRequisitoId(1L, 11L)).thenReturn(true);
        lenient().when(funcionarioRepository.save(f)).thenReturn(f);

        service.submeterPreAdmissao(1L);

        assertEquals(StatusAdmissao.AGUARDANDO_APROVACAO, f.getStatusAdmissao());
    }

    @Test
    @DisplayName("RN03: aprovar com TODOS os documentos APROVADOS ativa o funcionário")
    void aprovarAtivaFuncionario() {
        Funcionario f = Funcionario.builder().statusAdmissao(StatusAdmissao.AGUARDANDO_APROVACAO).build();
        f.setId(1L);
        when(funcionarioRepository.findById(1L)).thenReturn(Optional.of(f));
        when(requisitoDocumentoRepository.findAll())
                .thenReturn(List.of(requisito(10L, "CPF"), requisito(11L, "CTPS")));
        when(documentoRepository.existsByFuncionarioIdAndRequisitoIdAndStatus(
                1L, 10L, StatusDocumento.APROVADO)).thenReturn(true);
        when(documentoRepository.existsByFuncionarioIdAndRequisitoIdAndStatus(
                1L, 11L, StatusDocumento.APROVADO)).thenReturn(true);
        lenient().when(funcionarioRepository.save(f)).thenReturn(f);

        service.aprovarAdmissao(1L);

        assertEquals(StatusAdmissao.ATIVO, f.getStatusAdmissao());
    }

    @Test
    @DisplayName("RN03: não ativa se houver documento pendente/reprovado")
    void aprovarBloqueiaComDocumentoPendente() {
        Funcionario f = Funcionario.builder().statusAdmissao(StatusAdmissao.AGUARDANDO_APROVACAO).build();
        f.setId(1L);
        when(funcionarioRepository.findById(1L)).thenReturn(Optional.of(f));
        when(requisitoDocumentoRepository.findAll())
                .thenReturn(List.of(requisito(10L, "CPF"), requisito(11L, "CTPS")));
        when(documentoRepository.existsByFuncionarioIdAndRequisitoIdAndStatus(
                1L, 10L, StatusDocumento.APROVADO)).thenReturn(true);
        when(documentoRepository.existsByFuncionarioIdAndRequisitoIdAndStatus(
                1L, 11L, StatusDocumento.APROVADO)).thenReturn(false);

        assertThrows(BusinessException.class, () -> service.aprovarAdmissao(1L));
        assertEquals(StatusAdmissao.AGUARDANDO_APROVACAO, f.getStatusAdmissao());
    }

    @Test
    @DisplayName("RN03: motivo da revisao fica registrado no historico")
    void reprovarAdmissaoRegistraMotivo() {
        Funcionario funcionario = Funcionario.builder()
                .statusAdmissao(StatusAdmissao.AGUARDANDO_APROVACAO)
                .build();
        funcionario.setId(1L);
        when(funcionarioRepository.findById(1L)).thenReturn(Optional.of(funcionario));
        lenient().when(funcionarioRepository.save(funcionario)).thenReturn(funcionario);

        service.reprovarAdmissao(
                1L,
                "Corrigir comprovante de residencia.",
                9L,
                "Administrador RH"
        );

        ArgumentCaptor<HistoricoAlteracaoFuncionario> captor =
                ArgumentCaptor.forClass(HistoricoAlteracaoFuncionario.class);
        verify(historicoRepository).save(captor.capture());
        assertEquals("Orientação da pré-admissão", captor.getValue().getCampo());
        assertEquals("Corrigir comprovante de residencia.", captor.getValue().getValorNovo());
        assertEquals(StatusAdmissao.PRE_ADMISSAO, funcionario.getStatusAdmissao());
    }
}
