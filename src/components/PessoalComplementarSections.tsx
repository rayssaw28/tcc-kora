import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { isAxiosError } from 'axios';
import { ChevronDown, Pencil, Plus } from 'lucide-react-native';

import { api } from '@/api/client';
import {
  ApiError,
  DadosBancariosResponse,
  Escolaridade,
  FormacaoAcademicaResponse,
  TipoContaBancaria,
} from '@/api/types';
import { ui } from '@/components/ui';
import { color, type } from '@/constants/theme';

type Opcao = readonly [string, string];

const TIPOS_CONTA: readonly Opcao[] = [
  ['CORRENTE', 'Conta corrente'],
  ['POUPANCA', 'Conta poupança'],
  ['SALARIO', 'Conta salário'],
  ['PAGAMENTO', 'Conta de pagamento'],
];

const ESCOLARIDADES: readonly Opcao[] = [
  ['ENSINO_FUNDAMENTAL', 'Ensino fundamental'],
  ['ENSINO_MEDIO', 'Ensino médio'],
  ['TECNICO', 'Técnico'],
  ['TECNOLOGO', 'Tecnólogo'],
  ['GRADUACAO', 'Graduação'],
  ['POS_GRADUACAO', 'Pós-graduação'],
  ['MBA', 'MBA'],
  ['MESTRADO', 'Mestrado'],
  ['DOUTORADO', 'Doutorado'],
  ['POS_DOUTORADO', 'Pós-doutorado'],
];

type FormBanco = {
  banco: string;
  tipoConta: TipoContaBancaria | '';
  agencia: string;
  conta: string;
  chavePix: string;
};

type FormFormacao = {
  id?: number;
  escolaridade: Escolaridade | '';
  instituicaoEnsino: string;
  curso: string;
  anoConclusao: string;
};

const BANCO_VAZIO: FormBanco = {
  banco: '',
  tipoConta: '',
  agencia: '',
  conta: '',
  chavePix: '',
};

const FORMACAO_VAZIA: FormFormacao = {
  escolaridade: '',
  instituicaoEnsino: '',
  curso: '',
  anoConclusao: '',
};

export function DadosBancariosSection() {
  const [dados, setDados] = useState<DadosBancariosResponse | null>(null);
  const [form, setForm] = useState<FormBanco>(BANCO_VAZIO);
  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const { data } = await api.get<DadosBancariosResponse>(
        '/api/funcionarios/me/dados-bancarios',
      );
      setDados(data);
      setForm(criarFormBanco(data));
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível carregar os dados bancários.'));
    } finally {
      setCarregando(false);
    }
  }

  function cancelar() {
    setForm(criarFormBanco(dados));
    setErro(null);
    setEditando(false);
  }

  async function salvar() {
    if (!form.banco.trim() || !form.tipoConta || !form.agencia.trim()
        || !form.conta.trim() || !form.chavePix.trim()) {
      setErro('Preencha todos os dados bancários.');
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      const { data } = await api.put<DadosBancariosResponse>(
        '/api/funcionarios/me/dados-bancarios',
        {
          banco: form.banco.trim(),
          tipoConta: form.tipoConta,
          agencia: form.agencia.trim(),
          conta: form.conta.trim(),
          chavePix: form.chavePix.trim(),
        },
      );
      setDados(data);
      setForm(criarFormBanco(data));
      setEditando(false);
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível salvar os dados bancários.'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card
      titulo="Dados bancários"
      subtitulo={editando ? 'Edite os dados obrigatórios da conta' : 'Obrigatório para a pré-admissão'}
      editando={editando}
      onEditar={() => setEditando(true)}
    >
      {carregando ? <ActivityIndicator color={color.brand} /> : null}
      {erro ? <Text style={styles.error}>{erro}</Text> : null}
      {!carregando && editando ? (
        <View style={styles.form}>
          <Campo label="Banco" value={form.banco}
            onChangeText={(banco) => setForm((atual) => ({ ...atual, banco }))} />
          <Seletor label="Tipo de conta" valor={form.tipoConta} opcoes={TIPOS_CONTA}
            onChange={(tipoConta) => setForm((atual) => ({
              ...atual,
              tipoConta: tipoConta as TipoContaBancaria,
            }))} />
          <Campo label="Agência" value={form.agencia}
            onChangeText={(agencia) => setForm((atual) => ({ ...atual, agencia }))} />
          <Campo label="Conta" value={form.conta}
            onChangeText={(conta) => setForm((atual) => ({ ...atual, conta }))} />
          <Campo label="Chave Pix" value={form.chavePix}
            onChangeText={(chavePix) => setForm((atual) => ({ ...atual, chavePix }))} />
          <Acoes salvando={salvando} onCancelar={cancelar} onSalvar={salvar} />
        </View>
      ) : null}
      {!carregando && !editando ? (
        <View>
          <Linha label="Banco" valor={dados?.banco} />
          <Linha label="Tipo de conta" valor={rotulo(TIPOS_CONTA, dados?.tipoConta)} />
          <Linha label="Agência" valor={dados?.agencia} />
          <Linha label="Conta" valor={dados?.conta} />
          <Linha label="Chave Pix" valor={dados?.chavePix} />
        </View>
      ) : null}
    </Card>
  );
}

export function FormacaoAcademicaSection() {
  const [formacoes, setFormacoes] = useState<FormacaoAcademicaResponse[]>([]);
  const [formularios, setFormularios] = useState<FormFormacao[]>([FORMACAO_VAZIA]);
  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const anos = useMemo(() => {
    const limite = new Date().getFullYear() + 20;
    return Array.from(
      { length: limite - 1899 },
      (_, index) => [String(limite - index), String(limite - index)] as const,
    );
  }, []);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const { data } = await api.get<FormacaoAcademicaResponse[]>(
        '/api/funcionarios/me/formacoes',
      );
      setFormacoes(data);
      setFormularios(criarFormsFormacao(data));
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível carregar as formações.'));
    } finally {
      setCarregando(false);
    }
  }

  function atualizar(index: number, parcial: Partial<FormFormacao>) {
    setFormularios((atuais) =>
      atuais.map((item, atualIndex) => atualIndex === index ? { ...item, ...parcial } : item),
    );
  }

  function cancelar() {
    setFormularios(criarFormsFormacao(formacoes));
    setErro(null);
    setEditando(false);
  }

  async function salvar() {
    const incompleta = formularios.some(
      (item) => !item.escolaridade || !item.instituicaoEnsino.trim()
        || !item.curso.trim() || !item.anoConclusao,
    );
    if (incompleta) {
      setErro('Preencha todos os campos de cada formação acadêmica.');
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      const { data } = await api.put<FormacaoAcademicaResponse[]>(
        '/api/funcionarios/me/formacoes',
        {
          formacoes: formularios.map((item) => ({
            escolaridade: item.escolaridade,
            instituicaoEnsino: item.instituicaoEnsino.trim(),
            curso: item.curso.trim(),
            anoConclusao: Number(item.anoConclusao),
          })),
        },
      );
      setFormacoes(data);
      setFormularios(criarFormsFormacao(data));
      setEditando(false);
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível salvar as formações.'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card
      titulo="Formação acadêmica"
      subtitulo={editando ? 'Edite ou adicione formações' : 'Histórico de escolaridade'}
      editando={editando}
      onEditar={() => setEditando(true)}
    >
      {carregando ? <ActivityIndicator color={color.brand} /> : null}
      {erro ? <Text style={styles.error}>{erro}</Text> : null}
      {!carregando && editando ? (
        <View style={styles.form}>
          {formularios.map((item, index) => (
            <View key={`${item.id ?? 'nova'}-${index}`} style={styles.formacao}>
              <View style={styles.formacaoHeader}>
                <Text style={styles.formacaoTitle}>Formação {index + 1}</Text>
                {formularios.length > 1 ? (
                  <Pressable
                    onPress={() => setFormularios((atuais) =>
                      atuais.filter((_, atualIndex) => atualIndex !== index))}
                  >
                    <Text style={styles.removeText}>Remover</Text>
                  </Pressable>
                ) : null}
              </View>
              <Seletor label="Escolaridade" valor={item.escolaridade}
                opcoes={ESCOLARIDADES}
                onChange={(escolaridade) => atualizar(index, {
                  escolaridade: escolaridade as Escolaridade,
                })} />
              <Campo label="Instituição de ensino" value={item.instituicaoEnsino}
                onChangeText={(instituicaoEnsino) => atualizar(index, { instituicaoEnsino })} />
              <Campo label="Curso" value={item.curso}
                onChangeText={(curso) => atualizar(index, { curso })} />
              <Seletor label="Ano de conclusão" valor={item.anoConclusao}
                opcoes={anos}
                onChange={(anoConclusao) => atualizar(index, { anoConclusao })} />
            </View>
          ))}
          <Pressable
            style={styles.addButton}
            onPress={() => setFormularios((atuais) => [...atuais, { ...FORMACAO_VAZIA }])}
          >
            <Plus color={color.brand} size={16} strokeWidth={2.4} />
            <Text style={styles.addText}>Adicionar outra formação</Text>
          </Pressable>
          <Acoes salvando={salvando} onCancelar={cancelar} onSalvar={salvar} />
        </View>
      ) : null}
      {!carregando && !editando ? (
        <View style={styles.formacoesLista}>
          {formacoes.length ? formacoes.map((item, index) => (
            <View key={item.id} style={styles.formacaoResumo}>
              <Text style={styles.formacaoTitle}>Formação {index + 1}</Text>
              <Linha label="Escolaridade" valor={rotulo(ESCOLARIDADES, item.escolaridade)} />
              <Linha label="Instituição de ensino" valor={item.instituicaoEnsino} />
              <Linha label="Curso" valor={item.curso} />
              <Linha label="Ano de conclusão" valor={String(item.anoConclusao)} />
            </View>
          )) : <Text style={styles.empty}>Nenhuma formação cadastrada.</Text>}
        </View>
      ) : null}
    </Card>
  );
}

function Card({
  titulo,
  subtitulo,
  editando,
  onEditar,
  children,
}: {
  titulo: string;
  subtitulo: string;
  editando: boolean;
  onEditar: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{titulo}</Text>
          <Text style={styles.subtitle}>{subtitulo}</Text>
        </View>
        {!editando ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Editar ${titulo}`}
            style={({ pressed }) => [styles.editButton, pressed && { backgroundColor: color.sunken }]}
            onPress={onEditar}
          >
            <Pencil color={color.inkSoft} size={14} strokeWidth={2.2} />
            <Text style={ui.btnTextSm}>Editar</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function Campo({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (valor: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={color.placeholder}
      />
    </View>
  );
}

function Seletor({
  label,
  valor,
  opcoes,
  onChange,
}: {
  label: string;
  valor: string;
  opcoes: readonly Opcao[];
  onChange: (valor: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.selector} onPress={() => setAberto(true)}>
        <Text style={[styles.selectorText, !valor && styles.placeholder]}>
          {rotulo(opcoes, valor) || 'Selecionar'}
        </Text>
        <ChevronDown color={color.muted} size={18} strokeWidth={2.2} />
      </Pressable>
      <Modal visible={aberto} transparent animationType="fade"
        onRequestClose={() => setAberto(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{label}</Text>
            <ScrollView style={styles.options}>
              {opcoes.map(([codigo, texto]) => (
                <Pressable
                  key={codigo}
                  style={[styles.option, valor === codigo && styles.optionActive]}
                  onPress={() => {
                    onChange(codigo);
                    setAberto(false);
                  }}
                >
                  <Text style={styles.optionText}>{texto}</Text>
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

function Linha({ label, valor }: { label: string; valor?: string | null }) {
  return (
    <View style={styles.line}>
      <Text style={styles.lineLabel}>{label}</Text>
      <Text style={styles.lineValue}>{valor || 'Não informado'}</Text>
    </View>
  );
}

function Acoes({
  salvando,
  onCancelar,
  onSalvar,
}: {
  salvando: boolean;
  onCancelar: () => void;
  onSalvar: () => void;
}) {
  return (
    <View style={styles.actions}>
      <Pressable style={styles.cancelButton} onPress={onCancelar}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </Pressable>
      <Pressable style={styles.saveButton} disabled={salvando} onPress={onSalvar}>
        <Text style={styles.saveText}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
      </Pressable>
    </View>
  );
}

function criarFormBanco(dados: DadosBancariosResponse | null): FormBanco {
  return {
    banco: dados?.banco ?? '',
    tipoConta: dados?.tipoConta ?? '',
    agencia: dados?.agencia ?? '',
    conta: dados?.conta ?? '',
    chavePix: dados?.chavePix ?? '',
  };
}

function criarFormsFormacao(formacoes: FormacaoAcademicaResponse[]): FormFormacao[] {
  return formacoes.length
    ? formacoes.map((item) => ({
        id: item.id,
        escolaridade: item.escolaridade,
        instituicaoEnsino: item.instituicaoEnsino,
        curso: item.curso,
        anoConclusao: String(item.anoConclusao),
      }))
    : [{ ...FORMACAO_VAZIA }];
}

function rotulo(opcoes: readonly Opcao[], valor?: string | null): string {
  return opcoes.find(([codigo]) => codigo === valor)?.[1] ?? '';
}

function mensagemErro(e: unknown, fallback: string): string {
  if (isAxiosError(e)) {
    return (e.response?.data as ApiError | undefined)?.message ?? fallback;
  }
  return fallback;
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

  formacao: { gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: color.line },
  formacaoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  formacaoTitle: { color: color.ink, ...type.body, fontWeight: '600' },
  removeText: ui.btnTextDanger,
  addButton: { ...ui.link, paddingVertical: 8 },
  addText: ui.linkText,
  formacoesLista: { gap: 16 },
  formacaoResumo: { gap: 0 },
  empty: ui.empty,
});
