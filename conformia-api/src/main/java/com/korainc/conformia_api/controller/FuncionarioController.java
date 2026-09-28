package com.korainc.conformia_api.controller;

import com.korainc.conformia_api.dto.FuncionarioAtualizacaoRequest;
import com.korainc.conformia_api.dto.FuncionarioPreAdmissaoRequest;
import com.korainc.conformia_api.dto.FuncionarioProfissionalRequest;
import com.korainc.conformia_api.dto.AlteracaoSenhaRequest;
import com.korainc.conformia_api.dto.RedefinicaoSenhaRequest;
import com.korainc.conformia_api.dto.FuncionarioResponse;
import com.korainc.conformia_api.dto.FuncionarioFeedbackResumo;
import com.korainc.conformia_api.dto.DadosBancariosRequest;
import com.korainc.conformia_api.dto.DadosBancariosResponse;
import com.korainc.conformia_api.dto.DesligamentoRequest;
import com.korainc.conformia_api.dto.FormacaoAcademicaResponse;
import com.korainc.conformia_api.dto.FormacoesAcademicasRequest;
import com.korainc.conformia_api.dto.HistoricoAlteracaoFuncionarioResponse;
import com.korainc.conformia_api.dto.ReprovacaoRequest;
import com.korainc.conformia_api.security.AuthenticatedUser;
import com.korainc.conformia_api.service.EscopoService;
import com.korainc.conformia_api.service.DadosComplementaresService;
import com.korainc.conformia_api.service.FuncionarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/funcionarios")
@RequiredArgsConstructor
public class FuncionarioController {

    private final FuncionarioService service;
    private final EscopoService escopoService;
    private final DadosComplementaresService dadosComplementaresService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public FuncionarioResponse cadastrar(@Valid @RequestBody FuncionarioPreAdmissaoRequest request) {
        return service.cadastrarPreAdmissao(request);
    }

    @GetMapping
    public List<FuncionarioResponse> listar(@AuthenticationPrincipal AuthenticatedUser usuario) {
        return service.listarVisiveis(usuario);
    }

    @GetMapping("/diretorio-feedback")
    public List<FuncionarioFeedbackResumo> diretorioFeedback() {
        return service.listarDiretorioFeedback();
    }

    @GetMapping("/pendentes")
    @PreAuthorize("hasRole('ADMIN')")
    public List<FuncionarioResponse> pendentes() {
        return service.listarPendentesAprovacao();
    }

    @GetMapping("/desligados")
    @PreAuthorize("hasRole('ADMIN')")
    public List<FuncionarioResponse> desligados() {
        return service.listarDesligados();
    }

    @GetMapping("/desligados/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public FuncionarioResponse buscarDesligado(@PathVariable Long id) {
        return service.buscarDesligadoPorId(id);
    }

    @GetMapping("/{id}")
    public FuncionarioResponse buscarPorId(@PathVariable Long id,
                                           @AuthenticationPrincipal AuthenticatedUser usuario) {
        escopoService.validarAcesso(usuario, id);
        return service.buscarPorId(id);
    }

    @GetMapping("/{id}/historico")
    @PreAuthorize("hasRole('ADMIN')")
    public List<HistoricoAlteracaoFuncionarioResponse> historico(@PathVariable Long id) {
        return service.listarHistorico(id);
    }

    @GetMapping("/{id}/dados-bancarios")
    @PreAuthorize("hasRole('ADMIN')")
    public DadosBancariosResponse dadosBancariosDe(@PathVariable Long id) {
        return dadosComplementaresService.buscarDadosBancarios(id);
    }

    @GetMapping("/{id}/formacoes")
    public List<FormacaoAcademicaResponse> formacoesDe(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        escopoService.validarAcesso(usuario, id);
        return dadosComplementaresService.buscarFormacoes(id);
    }

    @PostMapping("/{id}/aprovar")
    @PreAuthorize("hasRole('ADMIN')")
    public FuncionarioResponse aprovar(@PathVariable Long id) {
        return service.aprovarAdmissao(id);
    }

    @PostMapping("/{id}/reprovar")
    @PreAuthorize("hasRole('ADMIN')")
    public FuncionarioResponse reprovar(@PathVariable Long id,
                                        @AuthenticationPrincipal AuthenticatedUser usuario,
                                        @Valid @RequestBody ReprovacaoRequest request) {
        return service.reprovarAdmissao(
                id,
                request.motivo(),
                usuario.getId(),
                usuario.getFuncionario().getNome()
        );
    }

    @PutMapping("/{id}/profissional")
    @PreAuthorize("hasRole('ADMIN')")
    public FuncionarioResponse atualizarDadosProfissionais(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser usuario,
            @Valid @RequestBody FuncionarioProfissionalRequest request
    ) {
        return service.atualizarDadosProfissionais(
                id, request, usuario.getId(), usuario.getFuncionario().getNome());
    }

    @PostMapping("/{id}/desligar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void desligar(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser usuario,
            @Valid @RequestBody DesligamentoRequest request
    ) {
        service.desligar(id, request.motivo(), usuario.getId(), usuario.getFuncionario().getNome());
    }

    @PutMapping("/{id}/senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void redefinirSenha(
            @PathVariable Long id,
            @Valid @RequestBody RedefinicaoSenhaRequest request
    ) {
        service.redefinirSenha(id, request);
    }

    @GetMapping("/me")
    public FuncionarioResponse meusDados(@AuthenticationPrincipal AuthenticatedUser usuario) {
        return service.buscarPorId(usuario.getFuncionario().getId());
    }

    @PutMapping("/me/senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void alterarMinhaSenha(
            @AuthenticationPrincipal AuthenticatedUser usuario,
            @Valid @RequestBody AlteracaoSenhaRequest request
    ) {
        service.alterarMinhaSenha(usuario.getId(), request);
    }

    @PutMapping("/me/senha-temporaria")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void trocarSenhaTemporaria(
            @AuthenticationPrincipal AuthenticatedUser usuario,
            @Valid @RequestBody RedefinicaoSenhaRequest request
    ) {
        service.trocarSenhaTemporaria(usuario.getId(), request);
    }

    @PutMapping("/me")
    public FuncionarioResponse atualizarMeusDados(@AuthenticationPrincipal AuthenticatedUser usuario,
                                                  @Valid @RequestBody FuncionarioAtualizacaoRequest request) {
        return service.atualizarDadosPessoais(
                usuario.getFuncionario().getId(),
                request,
                usuario.getFuncionario().getId(),
                usuario.getFuncionario().getNome()
        );
    }

    @GetMapping("/me/dados-bancarios")
    public DadosBancariosResponse meusDadosBancarios(
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        return dadosComplementaresService.buscarDadosBancarios(usuario.getId());
    }

    @PutMapping("/me/dados-bancarios")
    public DadosBancariosResponse atualizarMeusDadosBancarios(
            @AuthenticationPrincipal AuthenticatedUser usuario,
            @Valid @RequestBody DadosBancariosRequest request
    ) {
        return dadosComplementaresService.atualizarDadosBancarios(
                usuario.getId(),
                usuario.getFuncionario().getNome(),
                request
        );
    }

    @GetMapping("/me/formacoes")
    public List<FormacaoAcademicaResponse> minhasFormacoes(
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        return dadosComplementaresService.buscarFormacoes(usuario.getId());
    }

    @PutMapping("/me/formacoes")
    public List<FormacaoAcademicaResponse> atualizarMinhasFormacoes(
            @AuthenticationPrincipal AuthenticatedUser usuario,
            @Valid @RequestBody FormacoesAcademicasRequest request
    ) {
        return dadosComplementaresService.atualizarFormacoes(
                usuario.getId(),
                usuario.getFuncionario().getNome(),
                request
        );
    }

    @PostMapping("/me/submeter")
    public FuncionarioResponse submeter(@AuthenticationPrincipal AuthenticatedUser usuario) {
        return service.submeterPreAdmissao(usuario.getFuncionario().getId());
    }
}
