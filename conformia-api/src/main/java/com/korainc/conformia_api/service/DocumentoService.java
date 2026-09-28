package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.DocumentoResponse;
import com.korainc.conformia_api.dto.DocumentosPessoaisRequest;
import com.korainc.conformia_api.dto.DocumentosPessoaisResponse;
import com.korainc.conformia_api.entity.Documento;
import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.entity.HistoricoAlteracaoFuncionario;
import com.korainc.conformia_api.enums.StatusDocumento;
import com.korainc.conformia_api.enums.TipoDocumento;
import com.korainc.conformia_api.exception.BusinessException;
import com.korainc.conformia_api.exception.ResourceNotFoundException;
import com.korainc.conformia_api.infrastructure.FileStorageService;
import com.korainc.conformia_api.mapper.DocumentoMapper;
import com.korainc.conformia_api.repository.DocumentoRepository;
import com.korainc.conformia_api.repository.FuncionarioRepository;
import com.korainc.conformia_api.repository.HistoricoAlteracaoFuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class DocumentoService {

    private final DocumentoRepository repository;
    private final FuncionarioRepository funcionarioRepository;
    private final HistoricoAlteracaoFuncionarioRepository historicoRepository;
    private final RequisitoDocumentoService requisitoService;
    private final FileStorageService storage;
    private final DocumentoMapper mapper;

    @Transactional
    public DocumentoResponse enviar(
            Long funcionarioId,
            MultipartFile file,
            Long requisitoId
    ) {
        Funcionario funcionario = buscarFuncionario(funcionarioId);
        var requisito = requisitoService.buscar(requisitoId);
        TipoDocumento tipo = requisito.getTipo();
        String caminho = storage.store(file, "documentos/" + funcionarioId);

        Documento documento = Documento.builder()
                .funcionario(funcionario)
                .requisito(requisito)
                .tipo(tipo)
                .tituloPersonalizado(tipo == TipoDocumento.OUTRO ? requisito.getTitulo() : null)
                .nomeArquivo(file.getOriginalFilename())
                .caminho(caminho)
                .contentType(file.getContentType())
                .tamanhoBytes(file.getSize())
                .status(tipo == TipoDocumento.COMPROVANTE_RESIDENCIA
                        ? StatusDocumento.APROVADO
                        : StatusDocumento.PENDENTE)
                .build();

        return mapper.toResponse(repository.save(documento));
    }

    @Transactional(readOnly = true)
    public List<DocumentoResponse> listarDoFuncionario(Long funcionarioId) {
        return repository.findByFuncionarioId(funcionarioId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DocumentoResponse buscar(Long documentoId) {
        return mapper.toResponse(buscarEntidade(documentoId));
    }

    @Transactional(readOnly = true)
    public DocumentosPessoaisResponse buscarDadosPessoais(Long funcionarioId) {
        return toDocumentosPessoaisResponse(buscarFuncionarioIncluindoInativos(funcionarioId));
    }

    @Transactional
    public DocumentosPessoaisResponse atualizarDadosPessoais(
            Long funcionarioId,
            Long alteradoPorId,
            String alteradoPorNome,
            DocumentosPessoaisRequest request
    ) {
        Funcionario funcionario = buscarFuncionario(funcionarioId);
        if (funcionarioRepository.existsByCpfAndIdNot(request.cpf(), funcionarioId)) {
            throw new BusinessException("Já existe um funcionário com o CPF informado.");
        }

        List<HistoricoAlteracaoFuncionario> alteracoes = new ArrayList<>();
        registrarSensivel(alteracoes, funcionario, alteradoPorId, alteradoPorNome,
                "CPF", funcionario.getCpf(), request.cpf());
        registrarSensivel(alteracoes, funcionario, alteradoPorId, alteradoPorNome,
                "Número da CTPS", funcionario.getCtpsNumero(), request.ctpsNumero());
        registrarAlteracao(alteracoes, funcionario, alteradoPorId, alteradoPorNome,
                "Série da CTPS", funcionario.getCtpsSerie(), request.ctpsSerie());
        registrarAlteracao(alteracoes, funcionario, alteradoPorId, alteradoPorNome,
                "UF emissora da CTPS", valor(funcionario.getCtpsUfEmissor()),
                valor(request.ctpsUfEmissor()));
        registrarSensivel(alteracoes, funcionario, alteradoPorId, alteradoPorNome,
                "PIS", funcionario.getPis(), request.pis());
        registrarAlteracao(alteracoes, funcionario, alteradoPorId, alteradoPorNome,
                "CTPS digital", valor(funcionario.getCtpsDigital()), valor(request.ctpsDigital()));

        funcionario.setCpf(request.cpf());
        funcionario.setCtpsNumero(request.ctpsNumero().trim());
        funcionario.setCtpsSerie(request.ctpsSerie().trim());
        funcionario.setCtpsUfEmissor(request.ctpsUfEmissor());
        funcionario.setPis(request.pis());
        funcionario.setCtpsDigital(request.ctpsDigital());

        Funcionario salvo = funcionarioRepository.save(funcionario);
        historicoRepository.saveAll(alteracoes);
        return toDocumentosPessoaisResponse(salvo);
    }

    @Transactional
    public DocumentoResponse aprovar(Long documentoId) {
        Documento documento = buscarEntidade(documentoId);
        documento.setStatus(StatusDocumento.APROVADO);
        documento.setMotivoReprovacao(null);
        return mapper.toResponse(repository.save(documento));
    }

    @Transactional
    public DocumentoResponse reprovar(Long documentoId, String motivo) {
        Documento documento = buscarEntidade(documentoId);
        documento.setStatus(StatusDocumento.REPROVADO);
        documento.setMotivoReprovacao(motivo.trim());
        return mapper.toResponse(repository.save(documento));
    }

    @Transactional
    public void inativar(Long documentoId) {
        repository.delete(buscarEntidade(documentoId));
    }

    private Documento buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Documento não encontrado: id " + id));
    }

    private Funcionario buscarFuncionario(Long id) {
        return funcionarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Funcionário não encontrado: id " + id));
    }

    private Funcionario buscarFuncionarioIncluindoInativos(Long id) {
        return funcionarioRepository.findByIdIncluindoInativos(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Funcionário não encontrado: id " + id));
    }

    private DocumentosPessoaisResponse toDocumentosPessoaisResponse(Funcionario funcionario) {
        return new DocumentosPessoaisResponse(
                funcionario.getCpf(),
                funcionario.getCtpsNumero(),
                funcionario.getCtpsSerie(),
                funcionario.getCtpsUfEmissor(),
                funcionario.getPis(),
                funcionario.getCtpsDigital()
        );
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
        String anteriorLimpo = limpar(anterior);
        String novoLimpo = limpar(novo);
        if (!Objects.equals(anteriorLimpo, novoLimpo)) {
            alteracoes.add(novaAlteracao(
                    funcionario, alteradoPorId, alteradoPorNome,
                    campo, anteriorLimpo, novoLimpo));
        }
    }

    private void registrarSensivel(
            List<HistoricoAlteracaoFuncionario> alteracoes,
            Funcionario funcionario,
            Long alteradoPorId,
            String alteradoPorNome,
            String campo,
            String anterior,
            String novo
    ) {
        String anteriorLimpo = limpar(anterior);
        String novoLimpo = limpar(novo);
        if (!Objects.equals(anteriorLimpo, novoLimpo)) {
            alteracoes.add(novaAlteracao(
                    funcionario, alteradoPorId, alteradoPorNome,
                    campo, mascarar(anteriorLimpo), mascarar(novoLimpo)));
        }
    }

    private HistoricoAlteracaoFuncionario novaAlteracao(
            Funcionario funcionario,
            Long alteradoPorId,
            String alteradoPorNome,
            String campo,
            String anterior,
            String novo
    ) {
        return HistoricoAlteracaoFuncionario.builder()
                .funcionario(funcionario)
                .alteradoPorId(alteradoPorId)
                .alteradoPorNome(alteradoPorNome)
                .campo(campo)
                .valorAnterior(anterior)
                .valorNovo(novo)
                .build();
    }

    private String limpar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    private String valor(Object valor) {
        return valor == null ? null : valor.toString();
    }

    private String mascarar(String valor) {
        if (valor == null) {
            return null;
        }
        if (valor.length() <= 4) {
            return "*".repeat(valor.length());
        }
        return "*".repeat(valor.length() - 4) + valor.substring(valor.length() - 4);
    }
}
