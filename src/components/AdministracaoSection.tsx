import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { isAxiosError } from 'axios';

import { api } from '@/api/client';
import {
  ApiError,
  CargoResponse,
  DepartamentoResponse,
  FuncionarioResponse,
  TermoLgpdResponse,
} from '@/api/types';
import { SearchInput } from '@/components/SearchInput';
import { AddButton, ui } from '@/components/ui';
import { color, estilos } from '@/constants/theme';

type TipoCadastro = 'cargo' | 'departamento';

export function AdministracaoSection({
  cargos,
  departamentos,
  funcionarios,
  termo,
  onAtualizar,
}: {
  cargos: CargoResponse[];
  departamentos: DepartamentoResponse[];
  funcionarios: FuncionarioResponse[];
  termo: TermoLgpdResponse | null;
  onAtualizar: () => Promise<void>;
}) {
  const { width } = useWindowDimensions();
  const largo = width >= 1024;
  const [tipo, setTipo] = useState<TipoCadastro | null>(null);
  const [id, setId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [departamentoId, setDepartamentoId] = useState('');
  const [liderDiretoId, setLiderDiretoId] = useState('');
  const [buscaLider, setBuscaLider] = useState('');
  const [termoAberto, setTermoAberto] = useState(false);
  const [versao, setVersao] = useState('');
  const [url, setUrl] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const lideresDisponiveis = useMemo(() => {
    if (!departamentoId) return [];
    const termo = buscaLider.trim().toLocaleLowerCase('pt-BR');
    return funcionarios
      .filter((funcionario) => funcionario.perfil !== 'ADMIN')
      .filter((funcionario) => isCeo(funcionario)
        || (funcionario.perfil === 'GESTOR'
          && String(funcionario.departamentoId) === departamentoId))
      .filter((funcionario) => !termo
        || funcionario.nome.toLocaleLowerCase('pt-BR').includes(termo)
        || (funcionario.cargoNome ?? '').toLocaleLowerCase('pt-BR').includes(termo))
      .filter((funcionario, index, lista) =>
        lista.findIndex((item) => item.id === funcionario.id) === index)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [buscaLider, departamentoId, funcionarios]);

  function abrirCadastro(tipoCadastro: TipoCadastro, item?: CargoResponse | DepartamentoResponse) {
    setTipo(tipoCadastro);
    setId(item?.id ?? null);
    setNome(item?.nome ?? '');
    setDescricao(item?.descricao ?? '');
    if (tipoCadastro === 'cargo' && item && 'liderDiretoId' in item) {
      setDepartamentoId(String(item.departamentoId ?? ''));
      setLiderDiretoId(String(item.liderDiretoId ?? ''));
    } else {
      setDepartamentoId('');
      setLiderDiretoId('');
    }
    setBuscaLider('');
    setErro(null);
  }

  async function salvarCadastro() {
    if (!tipo || !nome.trim()) {
      setErro('Informe o nome.');
      return;
    }
    if (tipo === 'cargo' && !departamentoId) {
      setErro('Nome e departamento são obrigatórios.');
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const base = tipo === 'cargo' ? '/api/cargos' : '/api/departamentos';
      const body = tipo === 'cargo'
        ? {
            nome: nome.trim(),
            descricao: descricao.trim() || null,
            departamentoId: Number(departamentoId),
            liderDiretoId: liderDiretoId ? Number(liderDiretoId) : null,
          }
        : { nome: nome.trim(), descricao: descricao.trim() || null };
      if (id) await api.put(`${base}/${id}`, body);
      else await api.post(base, body);
      setTipo(null);
      await onAtualizar();
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível salvar.'));
    } finally {
      setSalvando(false);
    }
  }

  async function remover(tipoCadastro: TipoCadastro, itemId: number) {
    try {
      await api.delete(`${tipoCadastro === 'cargo' ? '/api/cargos' : '/api/departamentos'}/${itemId}`);
      await onAtualizar();
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível remover. Verifique se o cadastro está em uso.'));
    }
  }

  async function publicarTermo() {
    if (!versao.trim() || !url.trim()) {
      setErro('Informe a versão e o link do termo.');
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      await api.post('/api/termos/lgpd', { versao: versao.trim(), url: url.trim() });
      setTermoAberto(false);
      setVersao('');
      setUrl('');
      await onAtualizar();
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível publicar o termo.'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.stack}>
      {erro ? <Text style={styles.error}>{erro}</Text> : null}
      <View style={[styles.stack, largo && styles.colunas]}>
        <View style={[styles.stack, largo && styles.colunaPrincipal]}>
          <CadastroCard
            titulo="Cargos"
            itens={cargos}
            onAdicionar={() => abrirCadastro('cargo')}
            onEditar={(item) => abrirCadastro('cargo', item)}
            onRemover={(itemId) => remover('cargo', itemId)}
          />
        </View>
        <View style={[styles.stack, largo && styles.colunaLateral]}>
          <CadastroCard
            titulo="Departamentos"
            itens={departamentos}
            onAdicionar={() => abrirCadastro('departamento')}
            onEditar={(item) => abrirCadastro('departamento', item)}
            onRemover={(itemId) => remover('departamento', itemId)}
          />
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.title}>Termo LGPD</Text>
                <Text style={styles.subtitle}>
                  Versão atual: {termo?.versao ?? 'nenhum termo publicado'}
                </Text>
              </View>
            </View>
            {termo ? <Text style={styles.link} numberOfLines={1}>{termo.url}</Text> : null}
            <AddButton label="Publicar nova versão" onPress={() => setTermoAberto(true)} />
          </View>
        </View>
      </View>

      <Modal visible={tipo !== null} transparent animationType="fade" onRequestClose={() => setTipo(null)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{id ? 'Editar' : 'Novo'} {tipo}</Text>
            <Campo label={tipo === 'cargo' ? 'Nome *' : 'Nome'} value={nome} onChangeText={setNome} />
            <Campo label="Descrição" value={descricao} onChangeText={setDescricao} multiline />
            {tipo === 'cargo' ? (
              <>
                <Text style={styles.label}>Departamento *</Text>
                <View style={styles.chips}>
                  {departamentos.map((item) => (
                    <Pressable
                      key={item.id}
                      style={[
                        styles.chip,
                        departamentoId === String(item.id) && styles.chipActive,
                      ]}
                      onPress={() => {
                        setDepartamentoId(String(item.id));
                        setLiderDiretoId('');
                        setBuscaLider('');
                      }}
                    >
                      <Text style={[
                        styles.chipText,
                        departamentoId === String(item.id) && styles.chipTextActive,
                      ]}>
                        {item.nome}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {departamentoId ? (
                  <>
                    <Text style={styles.label}>Líder direto</Text>
                    <View style={styles.field}>
                      <Text style={styles.label}>Pesquisar por nome ou cargo</Text>
                      <SearchInput value={buscaLider}
                        onChangeText={setBuscaLider} />
                    </View>
                    <ScrollView
                      style={styles.leaders}
                      contentContainerStyle={styles.leadersContent}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator>
                      {lideresDisponiveis.map((funcionario) => (
                      <Pressable key={funcionario.id}
                        style={[
                          styles.leader,
                          liderDiretoId === String(funcionario.id) && styles.leaderActive,
                        ]}
                        onPress={() => setLiderDiretoId(String(funcionario.id))}>
                        <Text style={styles.itemTitle}>{funcionario.nome}</Text>
                        <Text style={styles.subtitle}>
                          {funcionario.cargoNome ?? 'Cargo não informado'}
                          {funcionario.departamentoNome ? `, ${funcionario.departamentoNome}` : ''}
                          {funcionario.perfil === 'GESTOR' ? ' (gestor)' : ''}
                        </Text>
                      </Pressable>
                      ))}
                      {!lideresDisponiveis.length ? (
                        <Text style={styles.subtitle}>
                          Nenhum gestor ou CEO disponível para vincular este cargo.
                        </Text>
                      ) : null}
                    </ScrollView>
                  </>
                ) : (
                  <Text style={styles.subtitle}>
                    Selecione um departamento para escolher o líder direto.
                  </Text>
                )}
              </>
            ) : null}
            <Rodape salvando={salvando} onCancelar={() => setTipo(null)} onSalvar={salvarCadastro} />
          </View>
        </View>
      </Modal>

      <Modal visible={termoAberto} transparent animationType="fade" onRequestClose={() => setTermoAberto(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Publicar termo LGPD</Text>
            <Text style={styles.subtitle}>
              Todos os colaboradores receberão uma notificação para aceitar novamente.
            </Text>
            <Campo label="Versão" value={versao} onChangeText={setVersao} />
            <Campo label="Link externo" value={url} onChangeText={setUrl} />
            <Rodape salvando={salvando} onCancelar={() => setTermoAberto(false)} onSalvar={publicarTermo} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function CadastroCard({
  titulo,
  itens,
  onAdicionar,
  onEditar,
  onRemover,
}: {
  titulo: string;
  itens: (CargoResponse | DepartamentoResponse)[];
  onAdicionar: () => void;
  onEditar: (item: CargoResponse | DepartamentoResponse) => void;
  onRemover: (id: number) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{titulo}</Text>
          <Text style={styles.subtitle}>{itens.length} {itens.length === 1 ? 'cadastrado' : 'cadastrados'}</Text>
        </View>
        <AddButton label="Adicionar" onPress={onAdicionar} />
      </View>
      <View style={styles.list}>
        {itens.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>{item.nome}</Text>
              {item.descricao ? <Text style={styles.subtitle}>{item.descricao}</Text> : null}
              {'liderDiretoId' in item ? (
                <Text style={styles.organization}>
                  {item.departamentoNome ?? 'Sem departamento'}, responde a{' '}
                  {item.liderDiretoNome ?? 'ninguém'}
                </Text>
              ) : null}
            </View>
            <Pressable style={styles.edit} onPress={() => onEditar(item)} accessibilityRole="button" accessibilityLabel={`Editar ${item.nome}`}>
              <Text style={styles.editText}>Editar</Text>
            </Pressable>
            <Pressable style={styles.remove} onPress={() => onRemover(item.id)} accessibilityRole="button" accessibilityLabel={`Excluir ${item.nome}`}>
              <Text style={styles.removeText}>Excluir</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

function Campo({ label, value, onChangeText, multiline }: {
  label: string; value: string; onChangeText: (value: string) => void; multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, multiline && styles.multiline]} value={value}
        onChangeText={onChangeText} multiline={multiline} autoCapitalize="sentences" />
    </View>
  );
}

function Rodape({ salvando, onCancelar, onSalvar }: {
  salvando: boolean; onCancelar: () => void; onSalvar: () => void;
}) {
  return (
    <View style={styles.footer}>
      <Pressable style={styles.cancel} onPress={onCancelar}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
      <Pressable style={styles.save} onPress={onSalvar} disabled={salvando}>
        <Text style={styles.saveText}>{salvando ? 'Salvando…' : 'Salvar'}</Text>
      </Pressable>
    </View>
  );
}

function mensagemErro(e: unknown, fallback: string): string {
  if (isAxiosError(e)) return (e.response?.data as ApiError | undefined)?.message ?? fallback;
  return fallback;
}

function isCeo(funcionario: FuncionarioResponse): boolean {
  return funcionario.cargoNome?.trim().toLocaleLowerCase('pt-BR') === 'ceo';
}

const styles = estilos(() => ({
  stack: { gap: 16 },
  colunas: { flexDirection: 'row', alignItems: 'flex-start', gap: 20 },
  colunaPrincipal: { flex: 1, minWidth: 0 },
  colunaLateral: { width: 420, flexShrink: 0 },
  card: ui.section,
  header: ui.header,
  headerText: ui.headerText,
  title: ui.title,
  subtitle: ui.subtitle,
  list: ui.list,
  item: ui.row,
  itemText: ui.rowText,
  itemTitle: ui.rowTitle,
  edit: { ...ui.btnSm, ...ui.btnSecondary },
  editText: ui.btnTextSm,
  remove: { ...ui.btnSm, ...ui.btnQuiet },
  removeText: ui.btnTextDanger,
  link: ui.rowMeta,
  overlay: ui.overlay,
  modal: ui.modal,
  modalTitle: ui.modalTitle,
  field: ui.field,
  label: ui.label,
  input: ui.input,
  multiline: ui.textarea,
  footer: ui.modalActions,
  cancel: { ...ui.btn, ...ui.btnSecondary },
  cancelText: ui.btnText,
  save: { ...ui.btn, ...ui.btnPrimary },
  saveText: ui.btnTextOnColor,
  error: ui.error,
  chips: ui.chips,
  chip: ui.chip,
  chipActive: ui.chipActive,
  chipText: ui.chipText,
  chipTextActive: ui.chipTextActive,
  organization: ui.rowMeta,
  leaders: { maxHeight: 220 },
  leadersContent: { gap: 4, paddingRight: 4 },
  leader: { borderWidth: 1, borderColor: color.line, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
  leaderActive: { borderColor: color.brand, backgroundColor: color.brandSoft },
  clearLeader: { alignSelf: 'flex-start', paddingVertical: 5 },
  clearLeaderText: ui.btnTextDanger,
}));
