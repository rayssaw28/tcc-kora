import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { isAxiosError } from 'axios';
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from 'lucide-react-native';

import { api } from '@/api/client';
import {
  ApiError,
  EstadoCivil,
  FuncionarioResponse,
  Genero,
  UfBrasil,
} from '@/api/types';
import { ESTADOS_CIVIS, GENEROS, PAISES, UFS } from '@/constants/pessoal';
import { ui } from '@/components/ui';
import { color, type } from '@/constants/theme';

type Opcao = readonly [string, string];

type FormularioPessoal = {
  nome: string;
  telefone: string;
  nacionalidades: string[];
  ufNatal: UfBrasil | '';
  cidadeNatal: string;
  genero: Genero | '';
  nomeSocial: string;
  estadoCivil: EstadoCivil | '';
  dataNascimento: string;
};

export function PessoalSection({
  me,
  onAtualizado,
}: {
  me: FuncionarioResponse;
  onAtualizado: (dados: FuncionarioResponse) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState<FormularioPessoal>(() => criarFormulario(me));

  useEffect(() => {
    if (!editando) {
      setForm(criarFormulario(me));
    }
  }, [editando, me]);

  function atualizar<K extends keyof FormularioPessoal>(campo: K, valor: FormularioPessoal[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function cancelar() {
    setForm(criarFormulario(me));
    setErro(null);
    setEditando(false);
  }

  async function salvar() {
    const validacao = validar(form);
    if (validacao) {
      setErro(validacao);
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      const { data } = await api.put<FuncionarioResponse>('/api/funcionarios/me', {
        nome: form.nome.trim(),
        telefone: somenteDigitos(form.telefone),
        nacionalidades: form.nacionalidades,
        ufNatal: form.ufNatal,
        cidadeNatal: form.cidadeNatal.trim(),
        genero: form.genero,
        nomeSocial: form.nomeSocial.trim() || null,
        estadoCivil: form.estadoCivil,
        dataNascimento: form.dataNascimento,
      });
      onAtualizado(data);
      setEditando(false);
    } catch (e) {
      if (isAxiosError(e)) {
        const data = e.response?.data as ApiError | undefined;
        setErro(data?.message ?? 'Não foi possível salvar os dados pessoais.');
      } else {
        setErro('Não foi possível salvar os dados pessoais.');
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Dados pessoais</Text>
          <Text style={styles.subtitle}>
            {editando ? 'Campos com * são obrigatórios' : 'Como você aparece no cadastro da empresa'}
          </Text>
        </View>
        {!editando ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={"Editar dados pessoais"}
            style={({ pressed }) => [styles.editButton, pressed && { backgroundColor: color.sunken }]}
            onPress={() => setEditando(true)}
          >
            <Pencil color={color.inkSoft} size={14} strokeWidth={2.2} />
            <Text style={ui.btnTextSm}>Editar</Text>
          </Pressable>
        ) : null}
      </View>

      {erro ? <Text style={styles.error}>{erro}</Text> : null}

      {editando ? (
        <View style={styles.form}>
          <CampoTexto
            label="Nome completo"
            obrigatorio
            value={form.nome}
            onChangeText={(valor) => atualizar('nome', valor)}
          />
          <CampoTexto
            label="Telefone"
            obrigatorio
            value={form.telefone}
            keyboardType="phone-pad"
            placeholder="(11) 91111-1111"
            onChangeText={(valor) => atualizar('telefone', formatarTelefone(valor))}
          />
          <SeletorMultiplo
            label="Nacionalidade(s)"
            obrigatorio
            valores={form.nacionalidades}
            opcoes={PAISES}
            onChange={(valores) => atualizar('nacionalidades', valores)}
          />
          <Seletor
            label="UF natal"
            obrigatorio
            valor={form.ufNatal}
            opcoes={UFS}
            onChange={(valor) => atualizar('ufNatal', valor as UfBrasil)}
          />
          <CampoTexto
            label="Cidade natal"
            obrigatorio
            value={form.cidadeNatal}
            onChangeText={(valor) => atualizar('cidadeNatal', valor)}
          />
          <Seletor
            label="Gênero"
            obrigatorio
            valor={form.genero}
            opcoes={GENEROS}
            onChange={(valor) => atualizar('genero', valor as Genero)}
          />
          <CampoTexto
            label="Nome social"
            value={form.nomeSocial}
            placeholder="Se aplicável"
            onChangeText={(valor) => atualizar('nomeSocial', valor)}
          />
          <Seletor
            label="Estado civil"
            obrigatorio
            valor={form.estadoCivil}
            opcoes={ESTADOS_CIVIS}
            onChange={(valor) => atualizar('estadoCivil', valor as EstadoCivil)}
          />
          <CalendarioInput
            label="Data de nascimento"
            obrigatorio
            valor={form.dataNascimento}
            onChange={(valor) => atualizar('dataNascimento', valor)}
          />

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
              onPress={cancelar}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              disabled={salvando}
              style={({ pressed }) => [
                styles.saveButton,
                (pressed || salvando) && styles.pressed,
              ]}
              onPress={salvar}
            >
              <Text style={styles.saveText}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View>
          <Linha label="Nome completo" value={me.nome} obrigatorio />
          <Linha label="Telefone" value={formatarTelefone(me.telefone ?? '') || 'Não informado'} obrigatorio />
          <Linha
            label="Nacionalidade(s)"
            value={me.nacionalidades?.join(', ') || 'Não informado'}
            obrigatorio
          />
          <Linha
            label="UF natal"
            value={rotuloOpcao(UFS, me.ufNatal) || 'Não informado'}
            obrigatorio
          />
          <Linha label="Cidade natal" value={me.cidadeNatal ?? 'Não informado'} obrigatorio />
          <Linha
            label="Gênero"
            value={rotuloOpcao(GENEROS, me.genero) || 'Não informado'}
            obrigatorio
          />
          <Linha label="Nome social" value={me.nomeSocial ?? 'Não informado'} />
          <Linha
            label="Estado civil"
            value={rotuloOpcao(ESTADOS_CIVIS, me.estadoCivil) || 'Não informado'}
            obrigatorio
          />
          <Linha
            label="Data de nascimento"
            value={formatarDataBr(me.dataNascimento) || 'Não informado'}
            obrigatorio
          />
        </View>
      )}
    </View>
  );
}

function CampoTexto({
  label,
  obrigatorio,
  ...props
}: {
  label: string;
  obrigatorio?: boolean;
  value: string;
  onChangeText: (valor: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad';
}) {
  return (
    <View style={styles.field}>
      <Rotulo label={label} obrigatorio={obrigatorio} />
      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor={color.placeholder}
      />
    </View>
  );
}

function Seletor({
  label,
  obrigatorio,
  valor,
  opcoes,
  onChange,
}: {
  label: string;
  obrigatorio?: boolean;
  valor: string;
  opcoes: readonly Opcao[];
  onChange: (valor: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  return (
    <View style={styles.field}>
      <Rotulo label={label} obrigatorio={obrigatorio} />
      <Pressable style={styles.selector} onPress={() => setAberto(true)}>
        <Text style={[styles.selectorText, !valor && styles.placeholder]}>
          {rotuloOpcao(opcoes, valor) || 'Selecionar'}
        </Text>
        <ChevronDown color={color.muted} size={18} strokeWidth={2.2} />
      </Pressable>
      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{label}</Text>
            <ScrollView style={styles.options}>
              {opcoes.map(([codigo, rotulo]) => (
                <Pressable
                  key={codigo}
                  style={[styles.option, valor === codigo && styles.optionActive]}
                  onPress={() => {
                    onChange(codigo);
                    setAberto(false);
                  }}
                >
                  <Text style={styles.optionText}>{rotulo}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={styles.cancelButton} onPress={() => setAberto(false)}>
              <Text style={styles.cancelText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SeletorMultiplo({
  label,
  obrigatorio,
  valores,
  opcoes,
  onChange,
}: {
  label: string;
  obrigatorio?: boolean;
  valores: string[];
  opcoes: readonly string[];
  onChange: (valores: string[]) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [temporarios, setTemporarios] = useState<string[]>(valores);

  function abrir() {
    setTemporarios(valores);
    setAberto(true);
  }

  function alternar(pais: string) {
    setTemporarios((atuais) =>
      atuais.includes(pais) ? atuais.filter((item) => item !== pais) : [...atuais, pais],
    );
  }

  return (
    <View style={styles.field}>
      <Rotulo label={label} obrigatorio={obrigatorio} />
      <Pressable style={styles.selector} onPress={abrir}>
        <Text style={[styles.selectorText, !valores.length && styles.placeholder]} numberOfLines={2}>
          {valores.length ? valores.join(', ') : 'Selecionar um ou mais países'}
        </Text>
        <ChevronDown color={color.muted} size={18} strokeWidth={2.2} />
      </Pressable>
      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{label}</Text>
            <ScrollView style={styles.options}>
              {opcoes.map((pais) => {
                const selecionado = temporarios.includes(pais);
                return (
                  <Pressable
                    key={pais}
                    style={[styles.option, selecionado && styles.optionActive]}
                    onPress={() => alternar(pais)}
                  >
                    <View style={styles.check}>
                      {selecionado
                        ? <Check color={color.brand} size={16} strokeWidth={2.5} />
                        : null}
                    </View>
                    <Text style={styles.optionText}>{pais}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={styles.actions}>
              <Pressable style={styles.cancelButton} onPress={() => setAberto(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.saveButton}
                onPress={() => {
                  onChange([...temporarios].sort());
                  setAberto(false);
                }}
              >
                <Text style={styles.saveText}>Concluir</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function CalendarioInput({
  label,
  obrigatorio,
  valor,
  onChange,
}: {
  label: string;
  obrigatorio?: boolean;
  valor: string;
  onChange: (valor: string) => void;
}) {
  const selecionada = lerData(valor);
  const [aberto, setAberto] = useState(false);
  const [selecionandoAno, setSelecionandoAno] = useState(false);
  const [mesAtual, setMesAtual] = useState(
    selecionada ?? new Date(new Date().getFullYear() - 18, new Date().getMonth(), 1),
  );
  const anos = useMemo(
    () => Array.from({ length: 100 }, (_, index) => new Date().getFullYear() - index),
    [],
  );
  const dias = montarMes(mesAtual);

  function abrir() {
    setMesAtual(selecionada ?? new Date(new Date().getFullYear() - 18, 0, 1));
    setSelecionandoAno(false);
    setAberto(true);
  }

  return (
    <View style={styles.field}>
      <Rotulo label={label} obrigatorio={obrigatorio} />
      <Pressable style={styles.selector} onPress={abrir}>
        <Text style={[styles.selectorText, !valor && styles.placeholder]}>
          {formatarDataBr(valor) || 'Selecionar no calendário'}
        </Text>
        <CalendarDays color={color.brand} size={18} strokeWidth={2.2} />
      </Pressable>
      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.calendarHeader}>
              <Pressable
                accessibilityLabel="Mês anterior"
                style={styles.calendarNavButton}
                onPress={() => setMesAtual(moverMes(mesAtual, -1))}
              >
                <ChevronLeft color={color.brand} size={21} strokeWidth={2.3} />
              </Pressable>
              <Pressable onPress={() => setSelecionandoAno((atual) => !atual)}>
                <Text style={styles.modalTitle}>{rotuloMes(mesAtual)}</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Próximo mês"
                style={styles.calendarNavButton}
                onPress={() => setMesAtual(moverMes(mesAtual, 1))}
              >
                <ChevronRight color={color.brand} size={21} strokeWidth={2.3} />
              </Pressable>
            </View>

            {selecionandoAno ? (
              <ScrollView style={styles.yearList}>
                {anos.map((ano) => (
                  <Pressable
                    key={ano}
                    style={styles.option}
                    onPress={() => {
                      setMesAtual(new Date(ano, mesAtual.getMonth(), 1));
                      setSelecionandoAno(false);
                    }}
                  >
                    <Text style={styles.optionText}>{ano}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <>
                <View style={styles.week}>
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, index) => (
                    <Text key={`${dia}-${index}`} style={styles.weekDay}>{dia}</Text>
                  ))}
                </View>
                <View style={styles.calendarGrid}>
                  {dias.map((dia, index) => {
                    if (!dia) {
                      return <View key={`vazio-${index}`} style={styles.day} />;
                    }
                    const futura = dia.getTime() >= inicioHoje().getTime();
                    const ativa = valor === dataIso(dia);
                    return (
                      <Pressable
                        key={dataIso(dia)}
                        disabled={futura}
                        style={[styles.day, ativa && styles.dayActive]}
                        onPress={() => {
                          onChange(dataIso(dia));
                          setAberto(false);
                        }}
                      >
                        <Text style={[styles.dayText, futura && styles.dayDisabled, ativa && styles.dayTextActive]}>
                          {dia.getDate()}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
            <Pressable style={styles.cancelButton} onPress={() => setAberto(false)}>
              <Text style={styles.cancelText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Rotulo({ label, obrigatorio }: { label: string; obrigatorio?: boolean }) {
  return (
    <Text style={styles.label}>
      {label}{obrigatorio ? <Text style={styles.required}> *</Text> : null}
    </Text>
  );
}

function Linha({
  label,
  value,
  obrigatorio,
}: {
  label: string;
  value: string;
  obrigatorio?: boolean;
}) {
  return (
    <View style={styles.line}>
      <Rotulo label={label} obrigatorio={obrigatorio} />
      <Text style={styles.lineValue}>{value}</Text>
    </View>
  );
}

function criarFormulario(me: FuncionarioResponse): FormularioPessoal {
  return {
    nome: me.nome,
    telefone: formatarTelefone(me.telefone ?? ''),
    nacionalidades: me.nacionalidades ?? [],
    ufNatal: me.ufNatal ?? '',
    cidadeNatal: me.cidadeNatal ?? '',
    genero: me.genero ?? '',
    nomeSocial: me.nomeSocial ?? '',
    estadoCivil: me.estadoCivil ?? '',
    dataNascimento: me.dataNascimento ?? '',
  };
}

function validar(form: FormularioPessoal): string | null {
  if (!form.nome.trim()) return 'Preencha o nome completo.';
  if (![10, 11].includes(somenteDigitos(form.telefone).length)) return 'Informe um telefone válido com DDD.';
  if (!form.nacionalidades.length) return 'Selecione ao menos uma nacionalidade.';
  if (!form.ufNatal) return 'Selecione a UF natal.';
  if (!form.cidadeNatal.trim()) return 'Preencha a cidade natal.';
  if (!form.genero) return 'Selecione o gênero.';
  if (!form.estadoCivil) return 'Selecione o estado civil.';
  if (!form.dataNascimento) return 'Selecione a data de nascimento.';
  return null;
}

function rotuloOpcao(opcoes: readonly Opcao[], valor?: string | null): string {
  return opcoes.find(([codigo]) => codigo === valor)?.[1] ?? '';
}

function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 11);
}

function formatarTelefone(valor: string): string {
  const digitos = somenteDigitos(valor);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

function lerData(valor?: string | null): Date | null {
  if (!valor) return null;
  const [ano, mes, dia] = valor.split('-').map(Number);
  if (!ano || !mes || !dia) return null;
  return new Date(ano, mes - 1, dia);
}

function formatarDataBr(valor?: string | null): string {
  const data = lerData(valor);
  return data
    ? `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`
    : '';
}

function dataIso(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}

function inicioHoje(): Date {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
}

function moverMes(data: Date, quantidade: number): Date {
  return new Date(data.getFullYear(), data.getMonth() + quantidade, 1);
}

function rotuloMes(data: Date): string {
  const texto = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function montarMes(data: Date): (Date | null)[] {
  const primeiro = new Date(data.getFullYear(), data.getMonth(), 1);
  const ultimoDia = new Date(data.getFullYear(), data.getMonth() + 1, 0).getDate();
  return [
    ...Array.from({ length: primeiro.getDay() }, () => null),
    ...Array.from(
      { length: ultimoDia },
      (_, index) => new Date(data.getFullYear(), data.getMonth(), index + 1),
    ),
  ];
}

const styles = StyleSheet.create({
  section: ui.section,
  header: ui.header,
  headerText: ui.headerText,
  title: ui.title,
  subtitle: ui.subtitle,
  editButton: { ...ui.btnSm, ...ui.btnSecondary },
  form: { gap: 14, maxWidth: 560 },
  field: ui.field,
  label: ui.label,
  required: ui.required,
  input: ui.input,
  selector: { ...ui.input, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  selectorText: { flex: 1, color: color.ink, ...type.body },
  placeholder: { color: color.placeholder },
  line: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', columnGap: 16, rowGap: 2, paddingVertical: 10, borderTopWidth: 1, borderTopColor: color.line },
  lineLabel: { color: color.muted, ...type.small },
  lineValue: { flexShrink: 1, color: color.ink, ...type.body, fontWeight: '500', textAlign: 'right' },
  actions: { ...ui.modalActions, justifyContent: 'flex-start' },
  saveButton: { ...ui.btn, ...ui.btnPrimary },
  saveText: ui.btnTextOnColor,
  cancelButton: { ...ui.btn, ...ui.btnSecondary },
  cancelText: ui.btnText,
  error: ui.error,
  overlay: ui.overlay,
  modal: { ...ui.modal, maxWidth: 440, maxHeight: '82%', gap: 12 },
  modalTitle: ui.modalTitle,
  options: { maxHeight: 430 },
  option: { minHeight: 44, borderTopWidth: 1, borderTopColor: color.line, paddingHorizontal: 8, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  optionActive: { backgroundColor: color.brandSoft },
  optionText: { color: color.ink, ...type.body },

  check: { width: 18, alignItems: 'center', justifyContent: 'center' },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calendarNavButton: ui.iconButtonBordered,
  week: { flexDirection: 'row' },
  weekDay: { width: '14.285%', textAlign: 'center', color: color.muted, ...type.caption, fontWeight: '600' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  day: { width: '14.285%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 99 },
  dayActive: { backgroundColor: color.brand },
  dayText: { color: color.ink, ...type.small, fontWeight: '500' },
  dayTextActive: { color: color.onBrand, fontWeight: '600' },
  dayDisabled: { color: color.lineStrong },
  yearList: { maxHeight: 350 },
  pressed: { opacity: 0.75 },
});
