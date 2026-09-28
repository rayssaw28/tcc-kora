package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.AtestadoResponse;
import com.korainc.conformia_api.entity.Atestado;
import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.enums.StatusDocumento;
import com.korainc.conformia_api.exception.BusinessException;
import com.korainc.conformia_api.exception.ResourceNotFoundException;
import com.korainc.conformia_api.infrastructure.FileStorageService;
import com.korainc.conformia_api.mapper.AtestadoMapper;
import com.korainc.conformia_api.repository.AtestadoRepository;
import com.korainc.conformia_api.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AtestadoService {

    private final AtestadoRepository repository;
    private final FuncionarioRepository funcionarioRepository;
    private final FileStorageService storage;
    private final AtestadoMapper mapper;

    @Transactional
    public AtestadoResponse enviar(Long funcionarioId, MultipartFile file,
                                   LocalDate dataInicio, LocalDate dataFim, String observacao) {
        if (dataInicio == null || dataFim == null) {
            throw new BusinessException("Informe a data de início e a data de fim do atestado.");
        }
        if (dataFim.isBefore(dataInicio)) {
            throw new BusinessException("A data de fim não pode ser anterior à data de início.");
        }

        Funcionario funcionario = buscarFuncionario(funcionarioId);
        String caminho = storage.store(file, "atestados/" + funcionarioId);

        Atestado atestado = Atestado.builder()
                .funcionario(funcionario)
                .dataInicio(dataInicio)
                .dataFim(dataFim)
                .observacao(observacao)
                .status(StatusDocumento.PENDENTE)
                .nomeArquivo(file.getOriginalFilename())
                .caminho(caminho)
                .contentType(file.getContentType())
                .tamanhoBytes(file.getSize())
                .build();

        return mapper.toResponse(repository.save(atestado));
    }

    @Transactional(readOnly = true)
    public List<AtestadoResponse> listarDoFuncionario(Long funcionarioId) {
        return repository.findByFuncionarioIdOrderByDataInicioDesc(funcionarioId)
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AtestadoResponse> listarPendentes() {
        return repository.findByStatusOrderByCriadoEmDesc(StatusDocumento.PENDENTE)
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AtestadoResponse buscar(Long id) {
        return mapper.toResponse(buscarEntidade(id));
    }

    @Transactional
    public AtestadoResponse aprovar(Long id) {
        Atestado atestado = buscarEntidade(id);
        atestado.setStatus(StatusDocumento.APROVADO);
        atestado.setMotivoReprovacao(null);
        return mapper.toResponse(repository.save(atestado));
    }

    @Transactional
    public AtestadoResponse reprovar(Long id, String motivo) {
        Atestado atestado = buscarEntidade(id);
        atestado.setStatus(StatusDocumento.REPROVADO);
        atestado.setMotivoReprovacao(motivo.trim());
        return mapper.toResponse(repository.save(atestado));
    }

    @Transactional(readOnly = true)
    public Long funcionarioDono(Long id) {
        return buscarEntidade(id).getFuncionario().getId();
    }

    @Transactional
    public void inativar(Long id) {
        repository.delete(buscarEntidade(id));
    }

    private Atestado buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Atestado não encontrado: id " + id));
    }

    private Funcionario buscarFuncionario(Long id) {
        return funcionarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado: id " + id));
    }
}
