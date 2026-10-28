import { isDesktopWeb } from '@/constants/responsive';
import { useMemo, useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';

import {
  CargoResponse,
  DepartamentoResponse,
  FuncionarioResponse,
  Perfil,
} from '@/api/types';
import { SearchInput } from '@/components/SearchInput';
import { ui } from '@/components/ui';
import { color, estilos, tomDoNome, type } from '@/constants/theme';

export type SecaoColaborador = 'dados' | 'documentos' | 'beneficios' | 'avaliacoes' | 'jornada';

export type NovoColaborador = {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  perfil: Perfil;
  departamentoId: number | null;
  cargoId: number | null;
  gestorId: number | null;
};

type Formulario = {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  perfil: Perfil;
  departamentoId: string;
  cargoId: string;
  gestorId: string;
};

const FORMULARIO_VAZIO: Formulario = {
  nome: '',
  cpf: '',
  email: '',
  senha: '',
  perfil: 'FUNCIONARIO',
  departamentoId: '',
  cargoId: '',
  gestorId: '',
};

const SECOES: { id: SecaoColaborador; label: string }[] = [
  { id: 'dados', label: 'Dados' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'beneficios', label: 'Salário' },
  { id: 'avaliacoes', label: 'Avaliações' },
  { id: 'jornada', label: 'Jornada' },
];

export function ColaboradoresSection({
  funcionarios,
  funcionariosDesligados = [],
  departamentos,
  cargos,
  selecionadoId,
  secao,
  onSelecionar,
  onSecaoChange,
  onCadastrar,
  conteudo,
  podeCadastrar,
  secoesDisponiveis,
}: {
  funcionarios: FuncionarioResponse[];
  funcionariosDesligados?: FuncionarioResponse[];
  departamentos: DepartamentoResponse[];
  cargos: CargoResponse[];
  selecionadoId: number | null;
  secao: SecaoColaborador;
  onSelecionar: (id: number) => void | Promise<void>;
  onSecaoChange: (secao: SecaoColaborador) => void;
  onCadastrar: (dados: NovoColaborador) => Promise<void>;
  conteudo: Record<SecaoColaborador, ReactNode>;
  podeCadastrar: boolean;
  secoesDisponiveis: SecaoColaborador[];
}) {
  const { width } = useWindowDimensions();
  const desktopWeb = isDesktopWeb(width);
  const [pesquisa, setPesquisa] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [cadastroAberto, setCadastroAberto] = useState(false);
  const [modoLista, setModoLista] = useState<'ativos' | 'desligados'>('ativos');
  const [desligadoSelecionadoId, setDesligadoSelecionadoId] = useState<number | null>(null);
  const [form, setForm] = useState<Formulario>(FORMULARIO_VAZIO);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const mapa = useMemo(
    () => new Map(funcionarios.map((funcionario) => [funcionario.id, funcionario])),
    [funcionarios],
  );
  const cargosDisponiveis = useMemo(
    () => cargos.filter((item) => String(item.departamentoId) === form.departamentoId),
    [cargos, form.departamentoId],
  );
  const lideresDisponiveis = useMemo(() => {
    if (!form.departamentoId || !form.cargoId) return [];
    const cargo = cargos.find((item) => String(item.id) === form.cargoId);
    const ceo = funcionarios.find(isCeo);
    if (!cargo?.liderDiretoId) return ceo ? [ceo] : [];

    const elegiveis: FuncionarioResponse[] = [];
    const visitados = new Set<number>();
    let atual = mapa.get(cargo.liderDiretoId);
    while (atual && !visitados.has(atual.id)) {
      visitados.add(atual.id);
      if (String(atual.departamentoId) === form.departamentoId || isCeo(atual)) {
        elegiveis.push(atual);
      }
      atual = atual.gestorId ? mapa.get(atual.gestorId) : undefined;
    }
    if (ceo && !elegiveis.some((item) => item.id === ceo.id)) {
      elegiveis.push(ceo);
    }
    return elegiveis;
  }, [cargos, form.cargoId, form.departamentoId, funcionarios, mapa]);
  const secaoAtiva = secoesDisponiveis.includes(secao)
    ? secao
    : secoesDisponiveis[0];
  const exibindoDesligados = modoLista === 'desligados';
  const listaAtual = exibindoDesligados ? funcionariosDesligados : funcionarios;
  const desligadoSelecionado = funcionariosDesligados.find(
    (item) => item.id === desligadoSelecionadoId,
  ) ?? null;
  const temDetalhe = exibindoDesligados ? Boolean(desligadoSelecionado) : Boolean(selecionadoId);

  const departamentosVisiveis = useMemo(
    () => Array.from(new Set(
      listaAtual
        .map((item) => item.departamentoNome)
        .filter((nome): nome is string => Boolean(nome)),
    )).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [listaAtual],
  );
  const filtrados = useMemo(() => {
    const termo = pesquisa.trim().toLocaleLowerCase('pt-BR');
    return listaAtual
      .filter((item) => !departamento || item.departamentoNome === departamento)
      .filter((item) => {
        if (!termo) return true;
        return [
          item.nome,
          item.cargoNome,
          item.departamentoNome,
          item.email,
        ].some((valor) => valor?.toLocaleLowerCase('pt-BR').includes(termo));
      })
      .sort((a, b) => {
        if (exibindoDesligados) {
          const dataA = a.dataDesligamento ? new Date(a.dataDesligamento).getTime() : 0;
          const dataB = b.dataDesligamento ? new Date(b.dataDesligamento).getTime() : 0;
          return (dataB - dataA) || a.nome.localeCompare(b.nome, 'pt-BR');
        }
        const nivel = profundidadeHierarquia(a, mapa) - profundidadeHierarquia(b, mapa);
        return nivel || a.nome.localeCompare(b.nome, 'pt-BR');
      });
  }, [departamento, exibindoDesligados, listaAtual, mapa, pesquisa]);

  async function cadastrar() {
    const cpf = form.cpf.replace(/\D/g, '');
    if (!form.nome.trim()
        || cpf.length !== 11
        || !form.email.trim()
        || form.senha.length < 6
        || !form.perfil
        || !form.departamentoId
        || !form.cargoId
        || !form.gestorId) {
      setErro(
        'Todos os campos são obrigatórios. O CPF deve ter 11 dígitos e a senha ao menos 6 caracteres.',
      );
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      await onCadastrar({
        nome: form.nome.trim(),
        cpf,
        email: form.email.trim(),
        senha: form.senha,
        perfil: form.perfil,
        departamentoId: numeroOuNulo(form.departamentoId),
        cargoId: numeroOuNulo(form.cargoId),
        gestorId: numeroOuNulo(form.gestorId),
      });
      setForm(FORMULARIO_VAZIO);
      setCadastroAberto(false);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível cadastrar o colaborador.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={[styles.container, desktopWeb && temDetalhe && styles.containerWeb]}>
      <View style={[styles.section, desktopWeb && temDetalhe && styles.directoryWeb]}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{podeCadastrar ? 'Pessoas' : 'Sua equipe'}</Text>
          </View>
          {podeCadastrar ? (
            <Pressable style={styles.addButton} onPress={() => setCadastroAberto(true)}>
              <Text style={styles.addButtonText}>Novo colaborador</Text>
            </Pressable>
          ) : null}
        </View>

        {podeCadastrar ? (
          <View style={styles.modeTabs}>
            <Pressable
              style={[styles.modeTab, !exibindoDesligados && styles.modeTabActive]}
              onPress={() => {
                setModoLista('ativos');
                setDepartamento('');
                if (selecionadoId && !funcionarios.some((item) => item.id === selecionadoId) && funcionarios[0]) {
                  void onSelecionar(funcionarios[0].id);
                }
              }}
            >
              <Text style={[styles.modeTabText, !exibindoDesligados && styles.modeTabTextActive]}>
                Ativos
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeTab, exibindoDesligados && styles.modeTabActive]}
              onPress={() => {
                setModoLista('desligados');
                setDepartamento('');
                if (!desligadoSelecionadoId && funcionariosDesligados[0]) {
                  setDesligadoSelecionadoId(funcionariosDesligados[0].id);
                  void onSelecionar(funcionariosDesligados[0].id);
                }
              }}
            >
              <Text style={[styles.modeTabText, exibindoDesligados && styles.modeTabTextActive]}>
                Desligados
              </Text>
            </Pressable>
          </View>
        ) : null}

        <SearchInput
          value={pesquisa}
          onChangeText={setPesquisa}
          placeholder="Buscar por nome, cargo ou e-mail"
        />

        <View style={styles.filters}>
          <Filtro
            label="Departamento"
            valor={departamento}
            opcoes={departamentosVisiveis}
            onChange={setDepartamento}
          />
        </View>

        <Text style={styles.resultCount}>
          {filtrados.length} {exibindoDesligados
            ? (filtrados.length === 1 ? 'desligado' : 'desligados')
            : (filtrados.length === 1 ? 'pessoa' : 'pessoas')}
        </Text>
        <View style={styles.employeeList}>
          {filtrados.map((funcionario) => {
            const ativo = exibindoDesligados
              ? desligadoSelecionadoId === funcionario.id
              : selecionadoId === funcionario.id;
            return (
              <Pressable
                key={funcionario.id}
                style={(estado) => [
                  styles.employee,
                  (estado as { hovered?: boolean }).hovered && !ativo && styles.employeeHover,
                  ativo && styles.employeeActive,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: ativo }}
                onPress={() => {
                  if (exibindoDesligados) {
                    setDesligadoSelecionadoId(funcionario.id);
                    void onSelecionar(funcionario.id);
                    return;
                  }
                  void onSelecionar(funcionario.id);
                }}
              >
                <Avatar nome={funcionario.nome} ativo={ativo} />
                <View style={styles.employeeText}>
                  <View style={styles.employeeHeaderLine}>
                    <Text style={[styles.employeeName, ativo && styles.employeeNameActive]} numberOfLines={1}>
                      {funcionario.nome}
                    </Text>
                    {funcionario.statusAdmissao !== 'ATIVO' && !exibindoDesligados ? (
                      <Text style={[styles.employeeStatus, statusTone(funcionario.statusAdmissao)]}>
                        {rotuloStatus(funcionario.statusAdmissao)}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.employeeMeta} numberOfLines={1}>
                    {exibindoDesligados
                      ? `Desligado em ${formatarDataCurta(funcionario.dataDesligamento)}`
                      : `${funcionario.cargoNome ?? 'Cargo não informado'}, ${funcionario.departamentoNome ?? 'sem departamento'}`}
                  </Text>
                </View>
              </Pressable>
            );
          })}
          {!filtrados.length ? (
            <Text style={styles.empty}>
              {exibindoDesligados
                ? 'Nenhum colaborador desligado encontrado.'
                : 'Nenhum colaborador encontrado.'}
            </Text>
          ) : null}
        </View>
      </View>

      {exibindoDesligados && desligadoSelecionado ? (
        <View style={[styles.detailPane, desktopWeb && styles.detailPaneWeb]}>
          <DesligadoDetalhes funcionario={desligadoSelecionado} />
          <Abas
            secoes={SECOES.filter((item) => secoesDisponiveis.includes(item.id))}
            ativa={secaoAtiva}
            onChange={onSecaoChange}
          />
          {secaoAtiva ? conteudo[secaoAtiva] : null}
        </View>
      ) : null}

      {!exibindoDesligados && selecionadoId ? (
        <View style={[styles.detailPane, desktopWeb && styles.detailPaneWeb]}>
          {mapa.get(selecionadoId) ? <PerfilResumo funcionario={mapa.get(selecionadoId)!} /> : null}
          <Abas
            secoes={SECOES.filter((item) => secoesDisponiveis.includes(item.id))}
            ativa={secaoAtiva}
            onChange={onSecaoChange}
          />
          {secaoAtiva ? conteudo[secaoAtiva] : null}
        </View>
      ) : null}

      <Modal
        visible={podeCadastrar && cadastroAberto}
        transparent
        animationType="fade"
        onRequestClose={() => setCadastroAberto(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <View style={styles.headerText}>
                <Text style={styles.modalTitle}>Novo colaborador</Text>
                <Text style={styles.subtitle}>A pessoa receberá acesso para completar a pré-admissão.</Text>
              </View>
              <Pressable
                accessibilityLabel="Fechar"
                style={styles.iconButton}
                onPress={() => setCadastroAberto(false)}
              >
                <X color={color.muted} size={20} strokeWidth={2} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.form}>
              {erro ? <Text style={styles.error}>{erro}</Text> : null}
              <Campo label="Nome completo *" value={form.nome}
                onChangeText={(nome) => setForm((atual) => ({ ...atual, nome }))} />
              <Campo label="CPF *" value={form.cpf} keyboardType="numeric"
                onChangeText={(cpf) => setForm((atual) => ({ ...atual, cpf }))} />
              <Campo label="E-mail profissional *" value={form.email}
                onChangeText={(email) => setForm((atual) => ({ ...atual, email }))} />
              <Campo label="Senha temporária *" value={form.senha} secureTextEntry
                onChangeText={(senha) => setForm((atual) => ({ ...atual, senha }))} />
              <SeletorCadastro
                label="Perfil *"
                valor={form.perfil}
                opcoes={[
                  ['FUNCIONARIO', 'Funcionário'],
                  ['GESTOR', 'Gestor'],
                ]}
                obrigatorio
                onChange={(perfil) => setForm((atual) => ({
                  ...atual,
                  perfil: perfil as Perfil,
                }))}
              />
              <SeletorCadastro
                label="Departamento *"
                valor={form.departamentoId}
                opcoes={departamentos.map((item) => [String(item.id), item.nome])}
                obrigatorio
                onChange={(departamentoId) => setForm((atual) => ({
                  ...atual,
                  departamentoId,
                  cargoId: '',
                  gestorId: '',
                }))}
              />
              {form.departamentoId ? (
                <SeletorCadastro
                  label="Cargo *"
                  valor={form.cargoId}
                  opcoes={cargosDisponiveis.map((item) => [String(item.id), item.nome])}
                  obrigatorio
                  onChange={(cargoId) => setForm((atual) => ({
                    ...atual,
                    cargoId,
                    gestorId: '',
                  }))}
                />
              ) : null}
              {form.departamentoId && form.cargoId ? (
                <>
                  <SeletorCadastro
                    label="Líder direto *"
                    valor={form.gestorId}
                    opcoes={lideresDisponiveis.map((item) => [
                      String(item.id),
                      `${item.nome}, ${item.cargoNome ?? 'cargo não informado'}`,
                    ])}
                    obrigatorio
                    onChange={(gestorId) => setForm((atual) => ({ ...atual, gestorId }))}
                  />
                  {!lideresDisponiveis.length ? (
                    <Text style={styles.hint}>
                      Não há um superior elegível deste departamento para o cargo selecionado.
                    </Text>
                  ) : null}
                </>
              ) : null}
            </ScrollView>
            <View style={styles.actions}>
              <Pressable style={styles.cancelButton} onPress={() => setCadastroAberto(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} disabled={salvando} onPress={cadastrar}>
                <Text style={styles.saveText}>{salvando ? 'Cadastrando…' : 'Cadastrar colaborador'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function PerfilResumo({ funcionario }: { funcionario: FuncionarioResponse }) {
  return (
    <View style={styles.perfil}>
      <View style={[styles.avatarLarge, { backgroundColor: tomDoNome(funcionario.nome).suave }]}>
        <Text style={[styles.avatarLargeText, { color: tomDoNome(funcionario.nome).texto }]}>{iniciais(funcionario.nome)}</Text>
      </View>
      <View style={styles.headerText}>
        <Text style={styles.perfilNome}>{funcionario.nome}</Text>
        <Text style={styles.subtitle}>
          {funcionario.cargoNome ?? 'Cargo não informado'}
          {funcionario.departamentoNome ? `, ${funcionario.departamentoNome}` : ''}
        </Text>
      </View>
      {funcionario.statusAdmissao !== 'ATIVO' ? (
        <Text style={[styles.employeeStatus, statusTone(funcionario.statusAdmissao)]}>
          {rotuloStatus(funcionario.statusAdmissao)}
        </Text>
      ) : null}
    </View>
  );
}

function Abas({
  secoes,
  ativa,
  onChange,
}: {
  secoes: { id: SecaoColaborador; label: string }[];
  ativa: SecaoColaborador | undefined;
  onChange: (secao: SecaoColaborador) => void;
}) {
  return (
    <View style={styles.subtabs} accessibilityRole="tablist">
      {secoes.map((item) => (
        <Pressable
          key={item.id}
          style={[styles.subtab, ativa === item.id && styles.subtabActive]}
          onPress={() => onChange(item.id)}
          accessibilityRole="tab"
          accessibilityState={{ selected: ativa === item.id }}
        >
          <Text style={[styles.subtabText, ativa === item.id && styles.subtabTextActive]}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function DesligadoDetalhes({ funcionario }: { funcionario: FuncionarioResponse }) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{funcionario.nome}</Text>
          <Text style={styles.subtitle}>Cadastro mantido apenas para consulta</Text>
        </View>
        <Text style={[styles.employeeStatus, styles.employeeStatusDanger]}>
          {rotuloStatus(funcionario.statusAdmissao)}
        </Text>
      </View>

      <View style={styles.detailsGrid}>
        <InfoDesligado label="Data do desligamento" value={formatarDataCurta(funcionario.dataDesligamento)} />
        <InfoDesligado label="Motivo" value={funcionario.motivoDesligamento ?? 'Não informado'} destaque />
        <InfoDesligado label="Responsável" value={funcionario.desligadoPorNome ?? 'Não informado'} />
        <InfoDesligado label="E-mail" value={funcionario.email} />
        <InfoDesligado label="Cargo" value={funcionario.cargoNome ?? 'Não informado'} />
        <InfoDesligado label="Departamento" value={funcionario.departamentoNome ?? 'Não informado'} />
        <InfoDesligado label="Gestor anterior" value={funcionario.gestorNome ?? 'Não informado'} />
        <InfoDesligado label="Admissão" value={formatarDataCurta(funcionario.dataAdmissao)} />
      </View>
    </View>
  );
}

function InfoDesligado({
  label,
  value,
  destaque = false,
}: {
  label: string;
  value: string;
  destaque?: boolean;
}) {
  return (
    <View style={[styles.infoCard, destaque && styles.infoCardHighlight]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Filtro({
  label,
  valor,
  opcoes,
  onChange,
}: {
  label: string;
  valor: string;
  opcoes: string[];
  onChange: (valor: string) => void;
}) {
  return (
    <View style={styles.filter}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>
        <Pressable
          style={[styles.chip, !valor && styles.chipActive]}
          onPress={() => onChange('')}
        >
          <Text style={[styles.chipText, !valor && styles.chipTextActive]}>Todos</Text>
        </Pressable>
        {opcoes.map((opcao) => (
          <Pressable
            key={opcao}
            style={[styles.chip, valor === opcao && styles.chipActive]}
            onPress={() => onChange(opcao)}
          >
            <Text style={[styles.chipText, valor === opcao && styles.chipTextActive]}>
              {opcao}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Campo({
  label,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (valor: string) => void;
  keyboardType?: 'default' | 'numeric';
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={label.includes('E-mail') ? 'none' : 'sentences'}
      />
    </View>
  );
}

function SeletorCadastro({
  label,
  valor,
  opcoes,
  onChange,
  obrigatorio = false,
}: {
  label: string;
  valor: string;
  opcoes: string[][];
  onChange: (valor: string) => void;
  obrigatorio?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.selector} onPress={() => setAberto(true)}>
        <Text style={[styles.selectorText, !valor && styles.placeholder]}>
          {opcoes.find(([id]) => id === valor)?.[1] ?? 'Selecionar'}
        </Text>
        <ChevronDown color={color.muted} size={18} strokeWidth={2} />
      </Pressable>
      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <View style={styles.overlay}>
          <View style={styles.optionModal}>
            <Text style={styles.modalTitle}>{label}</Text>
            <ScrollView>
              {!obrigatorio ? (
                <Pressable style={styles.option} onPress={() => {
                  onChange('');
                  setAberto(false);
                }}>
                  <Text style={styles.optionText}>Não informado</Text>
                </Pressable>
              ) : null}
              {opcoes.map(([id, texto]) => (
                <Pressable key={id} style={[styles.option, id === valor && styles.optionActive]} onPress={() => {
                  onChange(id);
                  setAberto(false);
                }}>
                  <Text style={styles.optionText}>{texto}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function profundidadeHierarquia(
  funcionario: FuncionarioResponse,
  mapa: Map<number, FuncionarioResponse>,
): number {
  let nivel = 0;
  let atual = funcionario;
  const visitados = new Set<number>();
  while (atual.gestorId && mapa.has(atual.gestorId) && !visitados.has(atual.id)) {
    visitados.add(atual.id);
    atual = mapa.get(atual.gestorId)!;
    nivel += 1;
  }
  return nivel;
}

function numeroOuNulo(valor: string): number | null {
  return valor ? Number(valor) : null;
}

function formatarDataCurta(valor?: string | null): string {
  if (!valor) return 'Não informado';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return 'Não informado';
  return data.toLocaleDateString('pt-BR');
}

function isCeo(funcionario: FuncionarioResponse): boolean {
  return funcionario.cargoNome?.trim().toLocaleLowerCase('pt-BR') === 'ceo';
}

function rotuloStatus(status: FuncionarioResponse['statusAdmissao']): string {
  if (status === 'PRE_ADMISSAO') return 'Pré-admissão';
  if (status === 'AGUARDANDO_APROVACAO') return 'Aguardando RH';
  if (status === 'DESLIGADO') return 'Desligado';
  return 'Ativo';
}

function Avatar({ nome, ativo }: { nome: string; ativo: boolean }) {
  const tom = tomDoNome(nome);
  return (
    <View style={[styles.avatar, { backgroundColor: tom.suave }, ativo && styles.avatarActive]}>
      <Text style={[styles.avatarText, { color: tom.texto }, ativo && styles.avatarTextActive]}>{iniciais(nome)}</Text>
    </View>
  );
}

function statusTone(status: FuncionarioResponse['statusAdmissao']) {
  if (status === 'AGUARDANDO_APROVACAO') return styles.employeeStatusWarning;
  if (status === 'PRE_ADMISSAO') return styles.employeeStatusInfo;
  if (status === 'DESLIGADO') return styles.employeeStatusDanger;
  return styles.employeeStatusOk;
}

function iniciais(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');
}

const styles = estilos(() => ({
  container: { gap: 16 },
  containerWeb: { flexDirection: 'row', alignItems: 'flex-start', gap: 20 },
  directoryWeb: { width: 340, flexShrink: 0 },
  detailPane: { gap: 16 },
  detailPaneWeb: { flex: 1, minWidth: 0 },
  section: ui.section,
  header: ui.header,
  headerText: ui.headerText,
  title: ui.title,
  subtitle: ui.subtitle,
  addButton: { ...ui.btnSm, ...ui.btnPrimary },
  addButtonText: ui.btnTextSmOnColor,
  modeTabs: ui.segmented,
  modeTab: ui.segment,
  modeTabActive: ui.segmentActive,
  modeTabText: ui.segmentText,
  modeTabTextActive: ui.segmentTextActive,
  filters: { gap: 8 },
  filter: { gap: 6 },
  label: ui.label,
  chips: ui.chips,
  chip: ui.chip,
  chipActive: ui.chipActive,
  chipText: ui.chipText,
  chipTextActive: ui.chipTextActive,
  resultCount: { ...ui.help, marginTop: 4 },
  employeeList: { gap: 2, marginHorizontal: -10 },
  empty: { ...ui.empty, paddingHorizontal: 10 },
  employee: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9 },
  employeeHover: { backgroundColor: color.canvas },
  employeeActive: { backgroundColor: color.brandSoft },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: color.sunken, alignItems: 'center', justifyContent: 'center' },
  avatarActive: { backgroundColor: color.brand },
  avatarLarge: { width: 48, height: 48, borderRadius: 24, backgroundColor: color.brandSoft, alignItems: 'center', justifyContent: 'center' },
  avatarLargeText: { color: color.brandStrong, ...type.lead, fontWeight: '600' },
  avatarText: { color: color.inkSoft, ...type.small, fontWeight: '700' },
  avatarTextActive: { color: color.onBrand },
  employeeText: { flex: 1, gap: 1, minWidth: 0 },
  employeeHeaderLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  employeeName: { flexShrink: 1, color: color.ink, ...type.body, fontWeight: '600' },
  employeeNameActive: { color: color.brandStrong },
  employeeMeta: ui.rowMeta,
  employeeLeader: { color: color.muted, ...type.caption },
  employeeStatus: { flexShrink: 0, overflow: 'hidden', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1, ...type.caption, fontWeight: '600' },
  employeeStatusOk: { color: color.brandStrong, backgroundColor: color.brandSoft },
  employeeStatusWarning: { color: color.warning, backgroundColor: color.warningSoft },
  employeeStatusInfo: { color: color.info, backgroundColor: color.infoSoft },
  employeeStatusDanger: { color: color.danger, backgroundColor: color.dangerSoft },
  perfil: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  perfilNome: { color: color.ink, ...type.title, fontWeight: '600' },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 24 },
  infoCard: { flexGrow: 1, flexBasis: 220, gap: 2, paddingVertical: 10, borderTopWidth: 1, borderTopColor: color.line },
  infoCardHighlight: { flexBasis: '100%', borderTopWidth: 0, backgroundColor: color.dangerSoft, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 6 },
  infoLabel: ui.rowMeta,
  infoValue: { color: color.ink, ...type.body, fontWeight: '500' },
  subtabs: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 24, borderBottomWidth: 1, borderBottomColor: color.line },
  subtab: { paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  subtabActive: { borderBottomColor: color.brand },
  subtabText: { color: color.muted, ...type.body, fontWeight: '500' },
  subtabTextActive: { color: color.ink, fontWeight: '600' },
  overlay: ui.overlay,
  modal: { ...ui.modal, maxWidth: 560 },
  modalHeader: ui.modalHeader,
  modalTitle: ui.modalTitle,
  iconButton: ui.iconButton,
  form: { gap: 12 },
  field: ui.field,
  input: ui.input,
  selector: { ...ui.input, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  selectorText: { flex: 1, color: color.ink, ...type.body },
  placeholder: { color: color.placeholder },
  error: ui.error,
  hint: { color: color.warning, backgroundColor: color.warningSoft, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, ...type.small },
  actions: ui.modalActions,
  cancelButton: { ...ui.btn, ...ui.btnSecondary },
  cancelText: ui.btnText,
  saveButton: { ...ui.btn, ...ui.btnPrimary },
  saveText: ui.btnTextOnColor,
  optionModal: { ...ui.modal, maxWidth: 440, maxHeight: '75%', gap: 8 },
  option: { borderTopWidth: 1, borderTopColor: color.line, paddingVertical: 12, paddingHorizontal: 4 },
  optionActive: { backgroundColor: color.brandSoft },
  optionText: { color: color.ink, ...type.body },
}));
