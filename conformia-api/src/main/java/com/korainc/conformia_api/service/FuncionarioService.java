package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.FuncionarioAtualizacaoRequest;
import com.korainc.conformia_api.dto.FuncionarioPreAdmissaoRequest;
import com.korainc.conformia_api.dto.FuncionarioProfissionalRequest;
import com.korainc.conformia_api.dto.AlteracaoSenhaRequest;
import com.korainc.conformia_api.dto.RedefinicaoSenhaRequest;
import com.korainc.conformia_api.dto.FuncionarioResponse;
import com.korainc.conformia_api.dto.FuncionarioFeedbackResumo;
import com.korainc.conformia_api.dto.HistoricoAlteracaoFuncionarioResponse;
import com.korainc.conformia_api.entity.Cargo;
import com.korainc.conformia_api.entity.Departamento;
import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.entity.HistoricoAlteracaoFuncionario;
import com.korainc.conformia_api.enums.Perfil;
import com.korainc.conformia_api.enums.StatusAdmissao;
import com.korainc.conformia_api.enums.StatusDocumento;
import com.korainc.conformia_api.exception.BusinessException;
import com.korainc.conformia_api.exception.ResourceNotFoundException;
import com.korainc.conformia_api.mapper.FuncionarioMapper;
import com.korainc.conformia_api.repository.CargoRepository;
import com.korainc.conformia_api.repository.DadosBancariosRepository;
import com.korainc.conformia_api.repository.DepartamentoRepository;
import com.korainc.conformia_api.repository.DocumentoRepository;
import com.korainc.conformia_api.repository.FuncionarioRepository;
import com.korainc.conformia_api.repository.HistoricoAlteracaoFuncionarioRepository;
import com.korainc.conformia_api.repository.RequisitoDocumentoRepository;
import com.korainc.conformia_api.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;

@Slf4j
@Service
@RequiredArgsConstructor
public class FuncionarioService {

    private final FuncionarioRepository repository;
    private final DepartamentoRepository departamentoRepository;
    private final CargoRepository cargoRepository;
    private final FuncionarioMapper mapper;
    private final PasswordEncoder passwordEncoder;
    private final EscopoService escopoService;
    private final DocumentoRepository documentoRepository;
    private final HistoricoAlteracaoFuncionarioRepository historicoRepository;
    private final RequisitoDocumentoRepository requisitoDocumentoRepository;
    private final DadosBancariosRepository dadosBancariosRepository;

    @Transactional
    public FuncionarioResponse cadastrarPreAdmissao(FuncionarioPreAdmissaoRequest request) {
        Perfil perfil = request.perfil() != null ? request.perfil() : Perfil.FUNCIONARIO;
        validarPerfilColaborador(perfil);
        if (repository.existsByEmail(request.email())) {
            throw new BusinessException("Já existe um funcionário com o e-mail '" + request.email() + "'.");
        }
        if (repository.existsByCpf(request.cpf())) {
            throw new BusinessException("Já existe um funcionário com o CPF informado.");
        }

        Departamento departamento = resolverDepartamento(request.departamentoId());
        Cargo cargo = resolverCargo(request.cargoId());
        validarCargoNoDepartamento(cargo, departamento);
        Funcionario gestor = resolverGestor(request.gestorId());
        validarGestorDoCadastro(gestor, cargo, departamento);

        Funcionario funcionario = Funcionario.builder()
                .nome(request.nome())
                .cpf(request.cpf())
                .email(request.email())
                .senhaHash(passwordEncoder.encode(request.senha()))
                .senhaTemporaria(true)
                .perfil(perfil)
                .statusAdmissao(StatusAdmissao.PRE_ADMISSAO)
                .departamento(departamento)
                .cargo(cargo)
                .build();
        funcionario.setGestor(gestor);

        return mapper.toResponse(repository.save(funcionario));
    }

    @Transactional(readOnly = true)
    public List<FuncionarioResponse> listar() {
        return repository.findByPerfilNot(Perfil.ADMIN).stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<FuncionarioResponse> listarVisiveis(AuthenticatedUser usuario) {
        List<Funcionario> visiveis;
        if (usuario.isAdmin()) {
            visiveis = repository.findByPerfilNot(Perfil.ADMIN);
        } else if (usuario.getFuncionario().getPerfil() == com.korainc.conformia_api.enums.Perfil.GESTOR) {
            visiveis = repository.findAllById(escopoService.idsSubordinados(usuario.getId()));
        } else {
            visiveis = repository.findById(usuario.getId()).map(List::of).orElse(List.of());
        }
        return visiveis.stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<FuncionarioFeedbackResumo> listarDiretorioFeedback() {
        return repository.findByStatusAdmissao(StatusAdmissao.ATIVO).stream()
                .filter(funcionario -> funcionario.getPerfil() != Perfil.ADMIN)
                .filter(funcionario -> funcionario.getDepartamento() == null
                        || !"Presidência".equalsIgnoreCase(funcionario.getDepartamento().getNome()))
                .map(funcionario -> new FuncionarioFeedbackResumo(
                        funcionario.getId(),
                        funcionario.getNome(),
                        funcionario.getDepartamento() != null
                                ? funcionario.getDepartamento().getId()
                                : null,
                        funcionario.getDepartamento() != null
                                ? funcionario.getDepartamento().getNome()
                                : null,
                        funcionario.getCargo() != null ? funcionario.getCargo().getNome() : null
                ))
                .sorted(java.util.Comparator.comparing(
                        FuncionarioFeedbackResumo::nome,
                        String.CASE_INSENSITIVE_ORDER
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public FuncionarioResponse buscarPorId(Long id) {
        return mapper.toResponse(buscarEntidade(id));
    }

    @Transactional(readOnly = true)
    public List<FuncionarioResponse> listarPendentesAprovacao() {
        return repository.findByStatusAdmissao(StatusAdmissao.AGUARDANDO_APROVACAO)
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<FuncionarioResponse> listarDesligados() {
        return repository.findDesligados().stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public FuncionarioResponse buscarDesligadoPorId(Long id) {
        return mapper.toResponse(repository.findDesligadoById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Colaborador desligado não encontrado: id " + id)));
    }

    @Transactional
    public FuncionarioResponse atualizarDadosPessoais(
            Long id,
            FuncionarioAtualizacaoRequest request,
            Long alteradoPorId,
            String alteradoPorNome
    ) {
        Funcionario funcionario = buscarEntidade(id);
        List<HistoricoAlteracaoFuncionario> alteracoes = new java.util.ArrayList<>();

        registrarAlteracao(alteracoes, funcionario, alteradoPorId, alteradoPorNome,
                "Nome completo", funcionario.getNome(), request.nome().trim());
        registrarAlteracao(alteracoes, funcionario, alteradoPorId, alteradoPorNome,
                "Telefone", funcionario.getTelefone(), normalizarTelefone(request.telefone()));
        registrarAlteracao(alteracoes, funcionario, alteradoPorId, alteradoPorNome,
                "Nacionalidade(s)", formatarConjunto(funcionario.getNacionalidades()),
                formatarConjunto(request.nacionalidades()));
        registrarAlteracao(alteracoes, funcionario, alteradoPorId, alteradoPorNome,
                "UF natal", valor(funcionario.getUfNatal()), valor(request.ufNatal()));
        registrarAlteracao(alteracoes, funcionario, alteradoPorId, alteradoPorNome,
                "Cidade natal", funcionario.getCidadeNatal(), request.cidadeNatal().trim());
        registrarAlteracao(alteracoes, funcionario, alteradoPorId, alteradoPorNome,
                "Gênero", valor(funcionario.getGenero()), valor(request.genero()));
        registrarAlteracao(alteracoes, funcionario, alteradoPorId, alteradoPorNome,
                "Nome social", funcionario.getNomeSocial(), limparOpcional(request.nomeSocial()));
        registrarAlteracao(alteracoes, funcionario, alteradoPorId, alteradoPorNome,
                "Estado civil", valor(funcionario.getEstadoCivil()), valor(request.estadoCivil()));
        registrarAlteracao(alteracoes, funcionario, alteradoPorId, alteradoPorNome,
                "Data de nascimento", valor(funcionario.getDataNascimento()), valor(request.dataNascimento()));

        funcionario.setNome(request.nome().trim());
        funcionario.setTelefone(normalizarTelefone(request.telefone()));
        funcionario.getNacionalidades().clear();
        funcionario.getNacionalidades().addAll(new TreeSet<>(request.nacionalidades()));
        funcionario.setUfNatal(request.ufNatal());
        funcionario.setCidadeNatal(request.cidadeNatal().trim());
        funcionario.setGenero(request.genero());
        funcionario.setNomeSocial(limparOpcional(request.nomeSocial()));
        funcionario.setEstadoCivil(request.estadoCivil());
        funcionario.setDataNascimento(request.dataNascimento());

        FuncionarioResponse response = mapper.toResponse(repository.save(funcionario));
        historicoRepository.saveAll(alteracoes);
        return response;
    }

    @Transactional(readOnly = true)
    public List<HistoricoAlteracaoFuncionarioResponse> listarHistorico(Long funcionarioId) {
        buscarEntidadeIncluindoInativos(funcionarioId);
        return historicoRepository.findByFuncionarioIdOrderByAlteradoEmDesc(funcionarioId).stream()
                .map(item -> new HistoricoAlteracaoFuncionarioResponse(
                        item.getId(),
                        item.getFuncionario().getId(),
                        item.getAlteradoPorId(),
                        item.getAlteradoPorNome(),
                        item.getCampo(),
                        item.getValorAnterior(),
                        item.getValorNovo(),
                        item.getAlteradoEm()
                ))
                .toList();
    }

    @Transactional
    public FuncionarioResponse submeterPreAdmissao(Long id) {
        Funcionario funcionario = buscarEntidade(id);

        if (funcionario.getStatusAdmissao() != StatusAdmissao.PRE_ADMISSAO) {
            throw new BusinessException("A pré-admissão só pode ser submetida quando o status é PRE_ADMISSAO. "
                    + "Status atual: " + funcionario.getStatusAdmissao() + ".");
        }
        if (funcionario.getTelefone() == null || funcionario.getTelefone().isBlank()
                || funcionario.getDataNascimento() == null) {
            throw new BusinessException("Preencha telefone e data de nascimento antes de submeter a pré-admissão.");
        }
        if (!dadosBancariosRepository.existsByFuncionarioId(funcionario.getId())) {
            throw new BusinessException("Preencha os dados bancários antes de submeter a pré-admissão.");
        }
        validarDocumentosEnviados(funcionario.getId());

        funcionario.setStatusAdmissao(StatusAdmissao.AGUARDANDO_APROVACAO);
        return mapper.toResponse(repository.save(funcionario));
    }

    @Transactional
    public FuncionarioResponse aprovarAdmissao(Long id) {
        Funcionario funcionario = buscarEntidade(id);
        if (funcionario.getStatusAdmissao() != StatusAdmissao.AGUARDANDO_APROVACAO) {
            throw new BusinessException("Só é possível aprovar uma admissão em AGUARDANDO_APROVACAO. "
                    + "Status atual: " + funcionario.getStatusAdmissao() + ".");
        }
        validarDocumentosAprovados(funcionario.getId());
        funcionario.setStatusAdmissao(StatusAdmissao.ATIVO);
        funcionario.setDataAdmissao(LocalDate.now());
        return mapper.toResponse(repository.save(funcionario));
    }

    private void validarDocumentosAprovados(Long funcionarioId) {
        var faltantes = requisitoDocumentoRepository.findAll().stream()
                .filter(requisito -> !documentoRepository
                        .existsByFuncionarioIdAndRequisitoIdAndStatus(
                                funcionarioId,
                                requisito.getId(),
                                StatusDocumento.APROVADO))
                .map(requisito -> requisito.getTitulo())
                .toList();
        if (!faltantes.isEmpty()) {
            throw new BusinessException(
                    "Documentos obrigatórios ainda não aprovados: "
                            + String.join(", ", faltantes) + ".");
        }
    }

    private void validarDocumentosEnviados(Long funcionarioId) {
        var faltantes = requisitoDocumentoRepository.findAll().stream()
                .filter(requisito -> !documentoRepository
                        .existsByFuncionarioIdAndRequisitoId(funcionarioId, requisito.getId()))
                .map(requisito -> requisito.getTitulo())
                .toList();
        if (!faltantes.isEmpty()) {
            throw new BusinessException(
                    "Documentos obrigatórios ainda não enviados: "
                            + String.join(", ", faltantes) + ".");
        }
    }

    @Transactional
    public FuncionarioResponse reprovarAdmissao(
            Long id,
            String motivo,
            Long responsavelId,
            String responsavelNome
    ) {
        Funcionario funcionario = buscarEntidade(id);
        if (funcionario.getStatusAdmissao() != StatusAdmissao.AGUARDANDO_APROVACAO) {
            throw new BusinessException("Só é possível reprovar uma admissão em AGUARDANDO_APROVACAO. "
                    + "Status atual: " + funcionario.getStatusAdmissao() + ".");
        }
        log.info("Pré-admissão do funcionário id {} reprovada pelo RH. Motivo: {}", id, motivo);
        historicoRepository.save(HistoricoAlteracaoFuncionario.builder()
                .funcionario(funcionario)
                .alteradoPorId(responsavelId)
                .alteradoPorNome(responsavelNome)
                .campo("Orientação da pré-admissão")
                .valorAnterior(null)
                .valorNovo(motivo.trim())
                .build());
        funcionario.setStatusAdmissao(StatusAdmissao.PRE_ADMISSAO);
        return mapper.toResponse(repository.save(funcionario));
    }

    @Transactional
    public FuncionarioResponse atualizarDadosProfissionais(
            Long id,
            FuncionarioProfissionalRequest request,
            Long alteradoPorId,
            String alteradoPorNome
    ) {
        Funcionario funcionario = buscarEntidade(id);
        if (funcionario.getPerfil() == Perfil.ADMIN) {
            throw new BusinessException("A conta administrativa não pode ter vínculo de colaborador.");
        }
        validarPerfilColaborador(request.perfil());
        Departamento departamento = resolverDepartamento(request.departamentoId());
        Cargo cargo = resolverCargo(request.cargoId());
        validarCargoNoDepartamento(cargo, departamento);
        Funcionario gestor = resolverGestorOuPadrao(request.gestorId(), cargo);
        validarNovoGestor(id, gestor);

        List<HistoricoAlteracaoFuncionario> alteracoes = new java.util.ArrayList<>();
        registrarAlteracao(alteracoes, funcionario, alteradoPorId, alteradoPorNome,
                "Perfil", valor(funcionario.getPerfil()), valor(request.perfil()));
        registrarAlteracao(alteracoes, funcionario, alteradoPorId, alteradoPorNome,
                "Departamento", nome(funcionario.getDepartamento()), nome(departamento));
        registrarAlteracao(alteracoes, funcionario, alteradoPorId, alteradoPorNome,
                "Cargo", nome(funcionario.getCargo()), nome(cargo));
        registrarAlteracao(alteracoes, funcionario, alteradoPorId, alteradoPorNome,
                "Líder direto", nome(funcionario.getGestor()), nome(gestor));

        funcionario.setPerfil(request.perfil());
        funcionario.setDepartamento(departamento);
        funcionario.setCargo(cargo);
        funcionario.setGestor(gestor);

        FuncionarioResponse response = mapper.toResponse(repository.save(funcionario));
        historicoRepository.saveAll(alteracoes);
        return response;
    }

    @Transactional
    public void desligar(Long id, String motivo, Long responsavelId, String responsavelNome) {
        if (id.equals(responsavelId)) {
            throw new BusinessException("Não é permitido desligar o próprio usuário.");
        }
        Funcionario funcionario = buscarEntidade(id);
        if (!repository.findByGestorId(id).isEmpty()) {
            throw new BusinessException(
                    "Realoque os subordinados diretos antes de desligar este colaborador.");
        }
        historicoRepository.save(HistoricoAlteracaoFuncionario.builder()
                .funcionario(funcionario)
                .alteradoPorId(responsavelId)
                .alteradoPorNome(responsavelNome)
                .campo("Status")
                .valorAnterior(valor(funcionario.getStatusAdmissao()))
                .valorNovo(valor(StatusAdmissao.DESLIGADO))
                .build());
        historicoRepository.save(HistoricoAlteracaoFuncionario.builder()
                .funcionario(funcionario)
                .alteradoPorId(responsavelId)
                .alteradoPorNome(responsavelNome)
                .campo("Motivo do desligamento")
                .valorAnterior(null)
                .valorNovo(motivo.trim())
                .build());
        funcionario.setStatusAdmissao(StatusAdmissao.DESLIGADO);
        funcionario.setDataDesligamento(OffsetDateTime.now());
        funcionario.setMotivoDesligamento(motivo.trim());
        funcionario.setDesligadoPorId(responsavelId);
        funcionario.setDesligadoPorNome(responsavelNome);
        funcionario.setAtivo(false);
        repository.save(funcionario);
    }

    @Transactional
    public void alterarMinhaSenha(Long id, AlteracaoSenhaRequest request) {
        Funcionario funcionario = buscarEntidade(id);
        if (!passwordEncoder.matches(request.senhaAtual(), funcionario.getSenhaHash())) {
            throw new BusinessException("A senha atual esta incorreta.");
        }
        funcionario.setSenhaHash(passwordEncoder.encode(request.novaSenha()));
        funcionario.setSenhaTemporaria(false);
        repository.save(funcionario);
    }

    @Transactional
    public void redefinirSenha(Long id, RedefinicaoSenhaRequest request) {
        Funcionario funcionario = buscarEntidade(id);
        funcionario.setSenhaHash(passwordEncoder.encode(request.novaSenha()));
        funcionario.setSenhaTemporaria(true);
        repository.save(funcionario);
    }

    @Transactional
    public void trocarSenhaTemporaria(Long id, RedefinicaoSenhaRequest request) {
        Funcionario funcionario = buscarEntidade(id);
        if (!funcionario.isSenhaTemporaria()) {
            throw new BusinessException("Não existe troca de senha pendente para este usuário.");
        }
        funcionario.setSenhaHash(passwordEncoder.encode(request.novaSenha()));
        funcionario.setSenhaTemporaria(false);
        repository.save(funcionario);
    }

    private Funcionario buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado: id " + id));
    }

    private Funcionario buscarEntidadeIncluindoInativos(Long id) {
        return repository.findByIdIncluindoInativos(id)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado: id " + id));
    }

    private Departamento resolverDepartamento(Long id) {
        if (id == null) {
            return null;
        }
        return departamentoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Departamento não encontrado: id " + id));
    }

    private Cargo resolverCargo(Long id) {
        if (id == null) {
            return null;
        }
        return cargoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Cargo não encontrado: id " + id));
    }

    private void validarPerfilColaborador(Perfil perfil) {
        if (perfil == Perfil.ADMIN) {
            throw new BusinessException(
                    "O perfil ADMIN é exclusivo da conta operacional e não pode ser atribuído a colaboradores.");
        }
    }

    private void validarCargoNoDepartamento(Cargo cargo, Departamento departamento) {
        if (cargo == null) {
            return;
        }
        if (departamento == null
                || cargo.getDepartamento() == null
                || !Objects.equals(cargo.getDepartamento().getId(), departamento.getId())) {
            throw new BusinessException(
                    "O cargo selecionado não pertence ao departamento informado.");
        }
    }

    private void validarGestorDoCadastro(
            Funcionario gestor,
            Cargo cargo,
            Departamento departamento
    ) {
        if (gestor == null || departamento == null || cargo == null) {
            throw new BusinessException(
                    "Departamento, cargo e líder direto são obrigatórios.");
        }
        if (!isCeo(gestor)
                && (gestor.getDepartamento() == null
                || !Objects.equals(gestor.getDepartamento().getId(), departamento.getId()))) {
            throw new BusinessException(
                    "O líder direto deve pertencer ao mesmo departamento do colaborador.");
        }

        if (isCeo(gestor)) {
            return;
        }

        Funcionario superior = cargo.getLiderDireto();
        Set<Long> visitados = new java.util.HashSet<>();
        while (superior != null && visitados.add(superior.getId())) {
            if (Objects.equals(superior.getId(), gestor.getId())) {
                return;
            }
            superior = superior.getGestor();
        }
        throw new BusinessException(
                "O líder direto deve ocupar um nível hierárquico superior ao cargo selecionado.");
    }

    private void registrarAlteracao(
            List<HistoricoAlteracaoFuncionario> alteracoes,
            Funcionario funcionario,
            Long alteradoPorId,
            String alteradoPorNome,
            String campo,
            String anterior,
            String novo
    ) {
        if (Objects.equals(limparOpcional(anterior), limparOpcional(novo))) {
            return;
        }
        alteracoes.add(HistoricoAlteracaoFuncionario.builder()
                .funcionario(funcionario)
                .alteradoPorId(alteradoPorId)
                .alteradoPorNome(alteradoPorNome)
                .campo(campo)
                .valorAnterior(limparOpcional(anterior))
                .valorNovo(limparOpcional(novo))
                .build());
    }

    private String normalizarTelefone(String telefone) {
        return telefone.replaceAll("\\D", "");
    }

    private String formatarConjunto(Set<String> valores) {
        if (valores == null || valores.isEmpty()) {
            return null;
        }
        return String.join(", ", new TreeSet<>(valores));
    }

    private String limparOpcional(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return valor.trim();
    }

    private String valor(Object valor) {
        return valor != null ? valor.toString() : null;
    }

    private String nome(Object entidade) {
        if (entidade instanceof Departamento departamento) {
            return departamento.getNome();
        }
        if (entidade instanceof Cargo cargo) {
            return cargo.getNome();
        }
        if (entidade instanceof Funcionario funcionario) {
            return funcionario.getNome();
        }
        return null;
    }

    private void validarNovoGestor(Long funcionarioId, Funcionario gestor) {
        Funcionario atual = gestor;
        Set<Long> visitados = new java.util.HashSet<>();
        while (atual != null && visitados.add(atual.getId())) {
            if (atual.getId().equals(funcionarioId)) {
                throw new BusinessException(
                        "O líder selecionado criaria um ciclo na hierarquia.");
            }
            atual = atual.getGestor();
        }
    }

    private Funcionario resolverGestor(Long id) {
        if (id == null) {
            return null;
        }
        Funcionario gestor = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Gestor não encontrado: id " + id));
        if (gestor.getPerfil() == Perfil.ADMIN) {
            throw new BusinessException("A conta administrativa não pode ser líder direto.");
        }
        return gestor;
    }

    private Funcionario resolverGestorOuPadrao(Long id, Cargo cargo) {
        if (id != null) {
            return resolverGestor(id);
        }
        return cargo != null ? cargo.getLiderDireto() : null;
    }

    private boolean isCeo(Funcionario funcionario) {
        return funcionario != null
                && funcionario.getCargo() != null
                && "ceo".equalsIgnoreCase(funcionario.getCargo().getNome().trim());
    }
}
