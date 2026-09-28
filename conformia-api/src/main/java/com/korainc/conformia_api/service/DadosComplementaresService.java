package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.DadosBancariosRequest;
import com.korainc.conformia_api.dto.DadosBancariosResponse;
import com.korainc.conformia_api.dto.FormacaoAcademicaItemRequest;
import com.korainc.conformia_api.dto.FormacaoAcademicaResponse;
import com.korainc.conformia_api.dto.FormacoesAcademicasRequest;
import com.korainc.conformia_api.entity.DadosBancarios;
import com.korainc.conformia_api.entity.FormacaoAcademica;
import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.entity.HistoricoAlteracaoFuncionario;
import com.korainc.conformia_api.exception.ResourceNotFoundException;
import com.korainc.conformia_api.repository.DadosBancariosRepository;
import com.korainc.conformia_api.repository.FormacaoAcademicaRepository;
import com.korainc.conformia_api.repository.FuncionarioRepository;
import com.korainc.conformia_api.repository.HistoricoAlteracaoFuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DadosComplementaresService {

    private final FuncionarioRepository funcionarioRepository;
    private final DadosBancariosRepository dadosBancariosRepository;
    private final FormacaoAcademicaRepository formacaoRepository;
    private final HistoricoAlteracaoFuncionarioRepository historicoRepository;

    @Transactional(readOnly = true)
    public DadosBancariosResponse buscarDadosBancarios(Long funcionarioId) {
        return dadosBancariosRepository.findByFuncionarioId(funcionarioId)
                .map(this::toResponse)
                .orElse(new DadosBancariosResponse(null, null, null, null, null, null));
    }

    @Transactional
    public DadosBancariosResponse atualizarDadosBancarios(
            Long funcionarioId,
            String alteradoPorNome,
            DadosBancariosRequest request
    ) {
        Funcionario funcionario = buscarFuncionario(funcionarioId);
        DadosBancarios dados = dadosBancariosRepository.findByFuncionarioId(funcionarioId)
                .orElseGet(() -> DadosBancarios.builder().funcionario(funcionario).build());
        List<HistoricoAlteracaoFuncionario> alteracoes = new ArrayList<>();

        registrarAlteracao(alteracoes, funcionario, alteradoPorNome,
                "Banco", dados.getBanco(), request.banco().trim());
        registrarAlteracao(alteracoes, funcionario, alteradoPorNome,
                "Tipo de conta", valor(dados.getTipoConta()), valor(request.tipoConta()));
        registrarAlteracao(alteracoes, funcionario, alteradoPorNome,
                "Agencia bancaria", dados.getAgencia(), request.agencia().trim());
        registrarAlteracaoSensivel(alteracoes, funcionario, alteradoPorNome,
                "Conta bancaria", dados.getConta(), request.conta());
        registrarAlteracaoSensivel(alteracoes, funcionario, alteradoPorNome,
                "Chave Pix", dados.getChavePix(), request.chavePix());

        dados.setBanco(request.banco().trim());
        dados.setTipoConta(request.tipoConta());
        dados.setAgencia(request.agencia().trim());
        dados.setConta(request.conta().trim());
        dados.setChavePix(request.chavePix().trim());

        DadosBancariosResponse response = toResponse(dadosBancariosRepository.save(dados));
        historicoRepository.saveAll(alteracoes);
        return response;
    }

    @Transactional(readOnly = true)
    public List<FormacaoAcademicaResponse> buscarFormacoes(Long funcionarioId) {
        return formacaoRepository.findByFuncionarioIdOrderByAnoConclusaoDescIdDesc(funcionarioId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<FormacaoAcademicaResponse> atualizarFormacoes(
            Long funcionarioId,
            String alteradoPorNome,
            FormacoesAcademicasRequest request
    ) {
        Funcionario funcionario = buscarFuncionario(funcionarioId);
        List<FormacaoAcademica> anteriores =
                formacaoRepository.findByFuncionarioIdOrderByAnoConclusaoDescIdDesc(funcionarioId);
        String valorAnterior = formatarFormacoesExistentes(anteriores);
        String valorNovo = formatarFormacoesRequest(request.formacoes());

        formacaoRepository.deleteByFuncionarioId(funcionarioId);
        List<FormacaoAcademica> salvas = formacaoRepository.saveAll(
                request.formacoes().stream()
                        .map(item -> FormacaoAcademica.builder()
                                .funcionario(funcionario)
                                .escolaridade(item.escolaridade())
                                .instituicaoEnsino(item.instituicaoEnsino().trim())
                                .curso(item.curso().trim())
                                .anoConclusao(item.anoConclusao())
                                .build())
                        .toList()
        );

        List<HistoricoAlteracaoFuncionario> alteracoes = new ArrayList<>();
        registrarAlteracao(alteracoes, funcionario, alteradoPorNome,
                "Formacao academica", valorAnterior, valorNovo);
        historicoRepository.saveAll(alteracoes);

        return salvas.stream()
                .map(this::toResponse)
                .sorted((a, b) -> Integer.compare(b.anoConclusao(), a.anoConclusao()))
                .toList();
    }

    private Funcionario buscarFuncionario(Long id) {
        return funcionarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Funcionário não encontrado: id " + id));
    }

    private DadosBancariosResponse toResponse(DadosBancarios dados) {
        return new DadosBancariosResponse(
                dados.getId(),
                dados.getBanco(),
                dados.getTipoConta(),
                dados.getAgencia(),
                dados.getConta(),
                dados.getChavePix()
        );
    }

    private FormacaoAcademicaResponse toResponse(FormacaoAcademica formacao) {
        return new FormacaoAcademicaResponse(
                formacao.getId(),
                formacao.getEscolaridade(),
                formacao.getInstituicaoEnsino(),
                formacao.getCurso(),
                formacao.getAnoConclusao()
        );
    }

    private void registrarAlteracao(
            List<HistoricoAlteracaoFuncionario> alteracoes,
            Funcionario funcionario,
            String alteradoPorNome,
            String campo,
            String anterior,
            String novo
    ) {
        String anteriorLimpo = limpar(anterior);
        String novoLimpo = limpar(novo);
        if (Objects.equals(anteriorLimpo, novoLimpo)) {
            return;
        }
        alteracoes.add(HistoricoAlteracaoFuncionario.builder()
                .funcionario(funcionario)
                .alteradoPorId(funcionario.getId())
                .alteradoPorNome(alteradoPorNome)
                .campo(campo)
                .valorAnterior(limitar(anteriorLimpo))
                .valorNovo(limitar(novoLimpo))
                .build());
    }

    private void registrarAlteracaoSensivel(
            List<HistoricoAlteracaoFuncionario> alteracoes,
            Funcionario funcionario,
            String alteradoPorNome,
            String campo,
            String anterior,
            String novo
    ) {
        String anteriorLimpo = limpar(anterior);
        String novoLimpo = limpar(novo);
        if (Objects.equals(anteriorLimpo, novoLimpo)) {
            return;
        }
        alteracoes.add(HistoricoAlteracaoFuncionario.builder()
                .funcionario(funcionario)
                .alteradoPorId(funcionario.getId())
                .alteradoPorNome(alteradoPorNome)
                .campo(campo)
                .valorAnterior(mascarar(anteriorLimpo))
                .valorNovo(mascarar(novoLimpo))
                .build());
    }

    private String formatarFormacoesExistentes(List<FormacaoAcademica> formacoes) {
        return formacoes.stream()
                .map(item -> String.join(" | ",
                        item.getEscolaridade().name(),
                        item.getInstituicaoEnsino(),
                        item.getCurso(),
                        item.getAnoConclusao().toString()))
                .collect(Collectors.joining("; "));
    }

    private String formatarFormacoesRequest(List<FormacaoAcademicaItemRequest> formacoes) {
        return formacoes.stream()
                .map(item -> String.join(" | ",
                        item.escolaridade().name(),
                        item.instituicaoEnsino().trim(),
                        item.curso().trim(),
                        item.anoConclusao().toString()))
                .collect(Collectors.joining("; "));
    }

    private String valor(Object valor) {
        return valor == null ? null : valor.toString();
    }

    private String limpar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    private String limitar(String valor) {
        return valor != null && valor.length() > 1000 ? valor.substring(0, 1000) : valor;
    }

    private String mascarar(String valor) {
        String limpo = limpar(valor);
        if (limpo == null) {
            return null;
        }
        if (limpo.length() <= 4) {
            return "*".repeat(limpo.length());
        }
        return "*".repeat(limpo.length() - 4) + limpo.substring(limpo.length() - 4);
    }
}
