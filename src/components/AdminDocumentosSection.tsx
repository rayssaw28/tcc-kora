import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { isAxiosError } from 'axios';

import { api } from '@/api/client';
import {
  ApiError,
  RequisitoDocumentoResponse,
  TipoDocumento,
} from '@/api/types';
import { AddButton, ui } from '@/components/ui';

const TIPOS: { id: TipoDocumento; label: string }[] = [
  { id: 'CPF', label: 'CPF' },
  { id: 'CARTEIRA_TRABALHO', label: 'Carteira de Trabalho' },
  { id: 'COMPROVANTE_RESIDENCIA', label: 'Comprovante de residência' },
  { id: 'OUTRO', label: 'Documento personalizado' },
];

export function AdminDocumentosSection({
  requisitos,
  onAtualizar,
}: {
  requisitos: RequisitoDocumentoResponse[];
  onAtualizar: () => Promise<void>;
}) {
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<RequisitoDocumentoResponse | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<TipoDocumento>('OUTRO');
  const [erro, setErro] = useState<string | null>(null);

  function abrir(item?: RequisitoDocumentoResponse) {
    setEditando(item ?? null);
    setTitulo(item?.titulo ?? '');
    setDescricao(item?.descricao ?? '');
    setTipo(item?.tipo ?? 'OUTRO');
    setErro(null);
    setAberto(true);
  }

  async function salvar() {
    if (!titulo.trim()) {
      setErro('Informe o nome do documento.');
      return;
    }
    try {
      const body = { titulo: titulo.trim(), tipo, descricao: descricao.trim() || null };
      if (editando) await api.put(`/api/requisitos-documentos/${editando.id}`, body);
      else await api.post('/api/requisitos-documentos', body);
      setAberto(false);
      await onAtualizar();
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível salvar o documento exigido.'));
    }
  }

  async function remover(id: number) {
    try {
      await api.delete(`/api/requisitos-documentos/${id}`);
      await onAtualizar();
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível remover o documento exigido.'));
    }
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Documentos exigidos</Text>
          <Text style={styles.subtitle}>
            Cada item aparece para envio no perfil de todos os colaboradores.
          </Text>
        </View>
        <AddButton label="Adicionar" onPress={() => abrir()} />
      </View>
      {erro && !aberto ? <Text style={styles.error}>{erro}</Text> : null}
      {requisitos.length ? (
        <View style={ui.list}>
          {requisitos.map((item) => (
            <View key={item.id} style={ui.row}>
              <View style={ui.rowText}>
                <Text style={ui.rowTitle}>{item.titulo}</Text>
                <Text style={ui.rowMeta}>{item.descricao ?? 'Sem orientação para o colaborador'}</Text>
              </View>
              <Pressable style={[ui.btnSm, ui.btnSecondary]} onPress={() => abrir(item)} accessibilityRole="button" accessibilityLabel={`Editar ${item.titulo}`}>
                <Text style={ui.btnTextSm}>Editar</Text>
              </Pressable>
              <Pressable style={[ui.btnSm, ui.btnQuiet]} onPress={() => remover(item.id)} accessibilityRole="button" accessibilityLabel={`Excluir ${item.titulo}`}>
                <Text style={ui.btnTextDanger}>Excluir</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <Text style={ui.empty}>Nenhum documento exigido. Adicione o primeiro para os colaboradores enviarem.</Text>
      )}

      <Modal visible={aberto} transparent animationType="fade"
        onRequestClose={() => setAberto(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editando ? 'Editar documento exigido' : 'Novo documento exigido'}
            </Text>
            {erro ? <Text style={styles.error}>{erro}</Text> : null}
            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} />
            <Text style={styles.label}>Tipo</Text>
            <View style={styles.chips}>
              {TIPOS.map((item) => (
                <Pressable key={item.id}
                  style={[styles.chip, tipo === item.id && styles.chipActive]}
                  onPress={() => setTipo(item.id)}>
                  <Text style={[styles.chipText, tipo === item.id && styles.chipTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>Orientação para o colaborador</Text>
            <TextInput style={[styles.input, styles.textarea]} value={descricao}
              onChangeText={setDescricao} multiline maxLength={255} />
            <View style={styles.actions}>
              <Pressable style={styles.cancel} onPress={() => setAberto(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.save} onPress={salvar}>
                <Text style={styles.saveText}>{editando ? 'Salvar alterações' : 'Adicionar documento'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function mensagemErro(e: unknown, fallback: string): string {
  if (isAxiosError(e)) return (e.response?.data as ApiError | undefined)?.message ?? fallback;
  return fallback;
}

const styles = StyleSheet.create({
  section: ui.section,
  header: ui.header,
  headerText: ui.headerText,
  title: ui.title,
  subtitle: ui.subtitle,
  error: ui.error,
  overlay: ui.overlay,
  modal: ui.modal,
  modalTitle: ui.modalTitle,
  label: ui.label,
  input: ui.input,
  textarea: ui.textarea,
  chips: ui.chips,
  chip: ui.chip,
  chipActive: ui.chipActive,
  chipText: ui.chipText,
  chipTextActive: ui.chipTextActive,
  actions: ui.modalActions,
  cancel: { ...ui.btn, ...ui.btnSecondary },
  cancelText: ui.btnText,
  save: { ...ui.btn, ...ui.btnPrimary },
  saveText: ui.btnTextOnColor,
});
