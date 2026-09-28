package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.DemonstrativoHoleriteResponse;
import com.korainc.conformia_api.dto.HoleriteResponse;
import com.korainc.conformia_api.entity.EspelhoPonto;
import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.entity.Holerite;
import com.korainc.conformia_api.enums.Perfil;
import com.korainc.conformia_api.exception.BusinessException;
import com.korainc.conformia_api.exception.ResourceNotFoundException;
import com.korainc.conformia_api.infrastructure.FileStorageService;
import com.korainc.conformia_api.mapper.HoleriteMapper;
import com.korainc.conformia_api.repository.EspelhoPontoRepository;
import com.korainc.conformia_api.repository.FuncionarioRepository;
import com.korainc.conformia_api.repository.HoleriteRepository;
import com.korainc.conformia_api.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HoleriteService {

    private static final Map<String, BigDecimal> SALARIOS_DEMONSTRACAO_POR_EMAIL = Map.of(
            "gregorio@conformia.demo", new BigDecimal("18000.00"),
            "patricia@conformia.demo", new BigDecimal("13500.00"),
            "marina@conformia.demo", new BigDecimal("12500.00"),
            "carlos@korainc.com.br", new BigDecimal("9000.00"),
            "pedro@korainc.com.br", new BigDecimal("5600.00"),
            "ana@korainc.com.br", new BigDecimal("5000.00"),
            "maria@korainc.com.br", new BigDecimal("3800.00")
    );

    private final HoleriteRepository repository;
    private final FuncionarioRepository funcionarioRepository;
    private final EspelhoPontoRepository espelhoPontoRepository;
    private final EscopoService escopoService;
    private final FileStorageService storage;
    private final HoleriteMapper mapper;

    @Transactional
    public HoleriteResponse enviar(Long funcionarioId, MultipartFile file, int mes, int ano) {
        if (mes < 1 || mes > 12) {
            throw new BusinessException("Mês inválido: " + mes + " (esperado 1 a 12).");
        }
        if (ano < 1900 || ano > 2200) {
            throw new BusinessException("Ano inválido: " + ano + ".");
        }
        if (!isPdf(file)) {
            throw new BusinessException("O holerite deve ser um arquivo PDF.");
        }

        Funcionario funcionario = buscarFuncionario(funcionarioId);
        if (repository.existsByFuncionarioIdAndAnoAndMes(funcionarioId, ano, mes)) {
            throw new BusinessException(
                    "Já existe um holerite para a competência " + mes + "/" + ano + " deste funcionário.");
        }

        String caminho = storage.store(file, "holerites/" + funcionarioId);
        Holerite holerite = Holerite.builder()
                .funcionario(funcionario)
                .mes(mes)
                .ano(ano)
                .nomeArquivo(file.getOriginalFilename())
                .caminho(caminho)
                .contentType(file.getContentType())
                .tamanhoBytes(file.getSize())
                .build();

        return mapper.toResponse(repository.save(holerite));
    }

    @Transactional(readOnly = true)
    public List<HoleriteResponse> listarDoFuncionario(Long funcionarioId) {
        return repository.findByFuncionarioIdOrderByAnoDescMesDesc(funcionarioId)
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<HoleriteResponse> listarTodos() {
        return repository.findAllByOrderByAnoDescMesDesc()
                .stream()
                .filter(holerite -> holerite.getFuncionario().getPerfil() != Perfil.ADMIN)
                .map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<DemonstrativoHoleriteResponse> listarDemonstrativos(AuthenticatedUser usuario) {
        if (usuario.getFuncionario().getPerfil() == Perfil.FUNCIONARIO) {
            return listarDemonstrativosDoFuncionario(usuario.getId());
        }
        YearMonth competencia = YearMonth.now().minusMonths(1);
        return funcionarioRepository.findAll().stream()
                .filter(funcionario -> funcionario.getPerfil() != Perfil.ADMIN)
                .map(funcionario -> demonstrativoMaisRecente(
                        funcionario,
                        competencia.getMonthValue(),
                        competencia.getYear()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DemonstrativoHoleriteResponse> listarDemonstrativosDoFuncionario(Long funcionarioId) {
        Funcionario funcionario = buscarFuncionarioIncluindoInativos(funcionarioId);
        List<Holerite> holerites = repository.findByFuncionarioIdOrderByAnoDescMesDesc(funcionarioId);
        if (holerites.isEmpty()) {
            YearMonth competencia = YearMonth.now().minusMonths(1);
            return List.of(demonstrativoMaisRecente(
                    funcionario,
                    competencia.getMonthValue(),
                    competencia.getYear()));
        }
        return holerites.stream()
                .map(holerite -> montarDemonstrativo(funcionario, holerite.getMes(), holerite.getAno(), holerite))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DemonstrativoHoleriteResponse> listarDemonstrativosDe(Long funcionarioId, AuthenticatedUser usuario) {
        boolean gestor = usuario.getFuncionario().getPerfil() == Perfil.GESTOR;
        if (!usuario.isAdmin() && !usuario.getId().equals(funcionarioId)) {
            if (!gestor || !escopoService.podeAcessar(usuario, funcionarioId)) {
                throw new AccessDeniedException("Voce nao tem acesso aos holerites deste funcionário.");
            }
        }
        return listarDemonstrativosDoFuncionario(funcionarioId);
    }

    @Transactional(readOnly = true)
    public HoleriteResponse buscar(Long holeriteId) {
        return mapper.toResponse(buscarEntidade(holeriteId));
    }

    @Transactional
    public void inativar(Long holeriteId) {
        repository.delete(buscarEntidade(holeriteId));
    }

    private DemonstrativoHoleriteResponse demonstrativoMaisRecente(Funcionario funcionario, int mes, int ano) {
        Holerite holerite = repository.findByFuncionarioIdAndAnoAndMes(funcionario.getId(), ano, mes).orElse(null);
        return montarDemonstrativo(funcionario, mes, ano, holerite);
    }

    private DemonstrativoHoleriteResponse montarDemonstrativo(Funcionario funcionario, int mes, int ano, Holerite holerite) {
        BigDecimal salarioBase = salarioBase(funcionario);
        BigDecimal comissao = comissao(funcionario);
        BigDecimal adicionalInsalubridade = adicionalInsalubridade(funcionario, salarioBase);
        BigDecimal adicionalPericulosidade = adicionalPericulosidade(funcionario, salarioBase);
        BigDecimal adicionalNoturno = adicionalNoturno(funcionario);

        EspelhoPonto ponto = espelhoPontoRepository
                .findByFuncionarioIdAndAnoAndMes(funcionario.getId(), ano, mes)
                .orElse(null);
        int horasExtrasMinutos = ponto == null ? 0 : ponto.getHorasExtrasMinutos();
        int horasFaltantesMinutos = ponto == null ? 0 : ponto.getHorasFaltantesMinutos();
        BigDecimal valorHora = salarioBase.divide(BigDecimal.valueOf(220), 6, RoundingMode.HALF_UP);
        BigDecimal horaExtra = valorHora
                .multiply(BigDecimal.valueOf(horasExtrasMinutos))
                .divide(BigDecimal.valueOf(60), 6, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("1.5"));
        int qtdDiasFalta = (int) Math.ceil(horasFaltantesMinutos / 480.0);
        BigDecimal descontoFaltas = salarioBase.divide(BigDecimal.valueOf(30), 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(qtdDiasFalta));

        BigDecimal salarioBruto = salarioBase
                .add(comissao)
                .add(adicionalInsalubridade)
                .add(adicionalPericulosidade)
                .add(adicionalNoturno)
                .add(horaExtra);
        BigDecimal descontoInss = calcularInss(salarioBruto);
        BigDecimal descontoIrrf = calcularIrrf(salarioBruto.subtract(descontoInss));
        BigDecimal salarioLiquido = salarioBruto.subtract(descontoInss).subtract(descontoFaltas).subtract(descontoIrrf);
        BigDecimal fgts = salarioBruto.multiply(new BigDecimal("0.08"));

        return new DemonstrativoHoleriteResponse(
                funcionario.getId(),
                funcionario.getNome(),
                funcionario.getDepartamento() == null ? null : funcionario.getDepartamento().getNome(),
                funcionario.getCargo() == null ? null : funcionario.getCargo().getNome(),
                mes,
                ano,
                moeda(salarioBase),
                moeda(comissao),
                moeda(adicionalInsalubridade),
                moeda(adicionalPericulosidade),
                moeda(adicionalNoturno),
                moeda(horaExtra),
                moeda(salarioBruto),
                moeda(descontoInss),
                qtdDiasFalta,
                diasDeFalta(ano, mes, qtdDiasFalta, funcionario.getId()),
                moeda(descontoFaltas),
                moeda(descontoIrrf),
                moeda(salarioLiquido),
                moeda(fgts),
                resumo(qtdDiasFalta, adicionalInsalubridade, adicionalPericulosidade, adicionalNoturno, horaExtra),
                alerta(qtdDiasFalta, adicionalInsalubridade, adicionalPericulosidade, adicionalNoturno),
                holerite == null ? null : mapper.toResponse(holerite)
        );
    }

    private boolean isPdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }
        String ct = file.getContentType();
        if (ct != null && ct.equalsIgnoreCase("application/pdf")) {
            return true;
        }
        String nome = file.getOriginalFilename();
        return nome != null && nome.toLowerCase().endsWith(".pdf");
    }

    private Holerite buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holerite não encontrado: id " + id));
    }

    private Funcionario buscarFuncionario(Long id) {
        Funcionario funcionario = funcionarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado: id " + id));
        if (funcionario.getPerfil() == Perfil.ADMIN) {
            throw new BusinessException("A conta administrativa não pode receber holerites.");
        }
        return funcionario;
    }

    private Funcionario buscarFuncionarioIncluindoInativos(Long id) {
        Funcionario funcionario = funcionarioRepository.findByIdIncluindoInativos(id)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado: id " + id));
        if (funcionario.getPerfil() == Perfil.ADMIN) {
            throw new BusinessException("A conta administrativa não pode receber holerites.");
        }
        return funcionario;
    }

    private BigDecimal salarioBase(Funcionario funcionario) {
        BigDecimal salarioDemonstracao = SALARIOS_DEMONSTRACAO_POR_EMAIL.get(
                funcionario.getEmail().toLowerCase());
        if (salarioDemonstracao != null) {
            return salarioDemonstracao;
        }

        String cargo = cargo(funcionario);
        if (cargo.contains("gerente")) return BigDecimal.valueOf(7700);
        if (cargo.contains("desenvolvedor")) return BigDecimal.valueOf(5056.74);
        if (cargo.contains("designer")) return BigDecimal.valueOf(4816.20);
        if (cargo.contains("rh")) return BigDecimal.valueOf(3300);
        return BigDecimal.valueOf(4550);
    }

    private BigDecimal comissao(Funcionario funcionario) {
        return cargo(funcionario).contains("gerente") ? BigDecimal.valueOf(650) : BigDecimal.ZERO;
    }

    private BigDecimal adicionalInsalubridade(Funcionario funcionario, BigDecimal salarioBase) {
        return cargo(funcionario).contains("rh") ? salarioBase.multiply(new BigDecimal("0.10")) : BigDecimal.ZERO;
    }

    private BigDecimal adicionalPericulosidade(Funcionario funcionario, BigDecimal salarioBase) {
        return cargo(funcionario).contains("engenharia") ? salarioBase.multiply(new BigDecimal("0.30")) : BigDecimal.ZERO;
    }

    private BigDecimal adicionalNoturno(Funcionario funcionario) {
        return cargo(funcionario).contains("desenvolvedor") ? BigDecimal.valueOf(220) : BigDecimal.ZERO;
    }

    private String cargo(Funcionario funcionario) {
        return funcionario.getCargo() == null ? "" : funcionario.getCargo().getNome().toLowerCase();
    }

    private BigDecimal calcularInss(BigDecimal base) {
        if (base.compareTo(BigDecimal.valueOf(1412)) <= 0) return base.multiply(new BigDecimal("0.075"));
        if (base.compareTo(BigDecimal.valueOf(2666.68)) <= 0) return base.multiply(new BigDecimal("0.09")).subtract(BigDecimal.valueOf(21.18));
        if (base.compareTo(BigDecimal.valueOf(4000.03)) <= 0) return base.multiply(new BigDecimal("0.12")).subtract(BigDecimal.valueOf(101.18));
        BigDecimal teto = base.min(BigDecimal.valueOf(7786.02));
        return teto.multiply(new BigDecimal("0.14")).subtract(BigDecimal.valueOf(181.18));
    }

    private BigDecimal calcularIrrf(BigDecimal base) {
        if (base.compareTo(BigDecimal.valueOf(2259.20)) <= 0) return BigDecimal.ZERO;
        if (base.compareTo(BigDecimal.valueOf(2826.65)) <= 0) return base.multiply(new BigDecimal("0.075")).subtract(BigDecimal.valueOf(169.44));
        if (base.compareTo(BigDecimal.valueOf(3751.05)) <= 0) return base.multiply(new BigDecimal("0.15")).subtract(BigDecimal.valueOf(381.44));
        if (base.compareTo(BigDecimal.valueOf(4664.68)) <= 0) return base.multiply(new BigDecimal("0.225")).subtract(BigDecimal.valueOf(662.77));
        return base.multiply(new BigDecimal("0.275")).subtract(BigDecimal.valueOf(896.00));
    }

    private List<LocalDate> diasDeFalta(int ano, int mes, int quantidade, Long funcionarioId) {
        return java.util.stream.IntStream.range(0, quantidade)
                .mapToObj(index -> LocalDate.of(ano, mes, Math.min(28, 6 + index + funcionarioId.intValue() % 7)))
                .toList();
    }

    private String resumo(int diasFalta, BigDecimal insalubridade, BigDecimal periculosidade,
                          BigDecimal noturno, BigDecimal horaExtra) {
        if (diasFalta > 0) {
            return "O salário líquido foi reduzido por falta registrada no ponto.";
        }
        if (horaExtra.signum() > 0 || insalubridade.signum() > 0
                || periculosidade.signum() > 0 || noturno.signum() > 0) {
            return "O salário recebeu adicionais calculados a partir da função e da jornada.";
        }
        return "O salário foi calculado sem faltas ou adicionais variáveis nesta competência.";
    }

    private String alerta(int diasFalta, BigDecimal insalubridade, BigDecimal periculosidade, BigDecimal noturno) {
        if (diasFalta > 0) return "Há faltas nesta competência. Confira os dias destacados.";
        if (insalubridade.signum() > 0) return "Inclui adicional de insalubridade.";
        if (periculosidade.signum() > 0) return "Inclui adicional de periculosidade.";
        if (noturno.signum() > 0) return "Inclui adicional noturno.";
        return "Sem ocorrências que reduzam o salário.";
    }

    private BigDecimal moeda(BigDecimal valor) {
        return valor.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }
}
