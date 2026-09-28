package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.EspelhoPontoRequest;
import com.korainc.conformia_api.dto.EspelhoPontoResponse;
import com.korainc.conformia_api.entity.EspelhoPonto;
import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.enums.Perfil;
import com.korainc.conformia_api.exception.BusinessException;
import com.korainc.conformia_api.exception.ResourceNotFoundException;
import com.korainc.conformia_api.mapper.EspelhoPontoMapper;
import com.korainc.conformia_api.repository.EspelhoPontoRepository;
import com.korainc.conformia_api.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EspelhoPontoService {

    private final EspelhoPontoRepository repository;
    private final FuncionarioRepository funcionarioRepository;
    private final CalculoHoras calculoHoras;
    private final EspelhoPontoMapper mapper;

    @Transactional
    public EspelhoPontoResponse receber(EspelhoPontoRequest request) {
        Funcionario funcionario = funcionarioRepository.findById(request.funcionarioId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Funcionário não encontrado: id " + request.funcionarioId()));
        if (funcionario.getPerfil() == Perfil.ADMIN) {
            throw new BusinessException("A conta administrativa não pode receber registros de ponto.");
        }

        CalculoHoras.Resultado calc = calculoHoras.calcular(
                request.horasPrevistasMinutos(), request.horasTrabalhadasMinutos());

        EspelhoPonto espelho = repository
                .findByFuncionarioIdAndAnoAndMes(funcionario.getId(), request.ano(), request.mes())
                .orElseGet(() -> EspelhoPonto.builder()
                        .funcionario(funcionario)
                        .ano(request.ano())
                        .mes(request.mes())
                        .build());

        espelho.setDiasUteis(request.diasUteis());
        espelho.setHorasPrevistasMinutos(request.horasPrevistasMinutos());
        espelho.setHorasTrabalhadasMinutos(request.horasTrabalhadasMinutos());
        espelho.setSaldoMinutos(calc.saldoMinutos());
        espelho.setHorasExtrasMinutos(calc.extrasMinutos());
        espelho.setHorasFaltantesMinutos(calc.faltantesMinutos());
        espelho.setClassificacao(calc.classificacao());
        espelho.setOrigem(request.origem());

        return mapper.toResponse(repository.save(espelho));
    }

    @Transactional(readOnly = true)
    public List<EspelhoPontoResponse> listarDoFuncionario(Long funcionarioId) {
        return repository.findByFuncionarioIdOrderByAnoDescMesDesc(funcionarioId)
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<EspelhoPontoResponse> listarSaldosNaoZerados() {
        return repository.findBySaldoMinutosNotOrderByAnoDescMesDesc(0)
                .stream()
                .filter(espelho -> espelho.getFuncionario().getPerfil() != Perfil.ADMIN)
                .map(mapper::toResponse).toList();
    }
}
