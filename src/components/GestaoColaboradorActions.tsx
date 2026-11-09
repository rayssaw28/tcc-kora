import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  CargoResponse,
  ConsentimentoResponse,
  DepartamentoResponse,
  FuncionarioResponse,
  Perfil,
} from '@/api/types';
import { Badge, ui } from '@/components/ui';
import { color, estilos, type } from '@/constants/theme';

export function GestaoColaboradorActions({
  funcionario,
  funcionarios,
  departamentos,
  cargos,
  consentimentos,
  onAprovar,
  onReprovar,
  onAtualizarProfissional,
  onDesligar,
  onRedefinirSenha,
}: {
  funcionario: FuncionarioResponse;
  funcionarios: FuncionarioResponse[];
  departamentos: DepartamentoResponse[];
  cargos: CargoResponse[];
  consentimentos: ConsentimentoResponse[];
  onAprovar: (id: number) => void;
  onReprovar: (id: number, motivo: string) => void;
  onAtualizarProfissional: (
    id: number,
    request: { perfil: Perfil; departamentoId: number | null; cargoId: number | null; gestorId: number | null },
  ) => Promise<void>;
  onDesligar: (id: number, motivo: string) => Promise<void>;
  onRedefinirSenha: (id: number, senha: string) => Promise<void>;
}) {
  const [modal, setModal] = useState<'vinculo' | 'revisao' | 'senha' | 'desligar' | null>(null);
  const [perfil, setPerfil] = useState<Perfil>(funcionario.perfil);
  const [departamentoId, setDepartamentoId] = useState(String(funcionario.departamentoId ?? ''));
  const [cargoId, setCargoId] = useState(String(funcionario.cargoId ?? ''));
  const [gestorId, setGestorId] = useState(String(funcionario.gestorId ?? ''));
  const [motivo, setMotivo] = useState('');
  const [motivoDesligamento, setMotivoDesligamento] = useState('');
  const [senha, setSenha] = useState('');
  const cargosDisponiveis = useMemo(
    () => cargos.filter((item) => String(item.departamentoId) === departamentoId),
    [cargos, departamentoId],
  );

  function abrirVinculo() {
    setPerfil(funcionario.perfil);
    setDepartamentoId(String(funcionario.departamentoId ?? ''));
    setCargoId(String(funcionario.cargoId ?? ''));
    setGestorId(String(funcionario.gestorId ?? ''));
    setModal('vinculo');
  }

  return (
    <View style={styles.stack}>
      {funcionario.statusAdmissao === 'AGUARDANDO_APROVACAO' ? (
        <View style={styles.aviso}>
          <Text style={styles.avisoTitulo}>Pré-admissão aguardando sua análise</Text>
          <Text style={styles.avisoTexto}>
            Confira os dados e documentos abaixo antes de aprovar a admissão.
          </Text>
          <View style={styles.actions}>
            <Botao label="Aprovar admissão" tom="primario" onPress={() => onAprovar(funcionario.id)} />
            <Botao label="Pedir correções" onPress={() => setModal('revisao')} />
          </View>
        </View>
      ) : null}

      <View style={styles.card}>
        <View>
          <Text style={styles.title}>Gestão do vínculo</Text>
          <Text style={styles.subtitle}>Cargo, liderança e acesso ao sistema</Text>
        </View>
        <View style={styles.actions}>
          <Botao label="Editar cargo e liderança" onPress={abrirVinculo} />
          <Botao label="Redefinir senha" onPress={() => setModal('senha')} />
          <Botao label="Desligar colaborador" tom="perigo" onPress={() => setModal('desligar')} />
        </View>
      </View>

      <View style={styles.card}>
        <View>
          <Text style={styles.title}>Termo LGPD</Text>
          <Text style={styles.subtitle}>Versões do termo assinadas por esta pessoa</Text>
        </View>
        {consentimentos.length ? (
          <View>
            {consentimentos.map((item) => (
              <View key={item.id} style={styles.consentimento}>
                <View style={styles.consentimentoText}>
                  <Text style={styles.itemTitle}>Versão {item.versaoTermo}</Text>
                  <Text style={styles.subtitle}>{formatarData(item.registradoEm)}</Text>
                </View>
                <Badge label={item.aceito ? 'Aceito' : 'Não aceito'} tom={item.aceito ? 'ok' : 'bad'} />
              </View>
            ))}
          </View>
        ) : <Text style={styles.empty}>Nenhuma assinatura registrada.</Text>}
      </View>

      <Modal visible={modal === 'vinculo'} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <View style={styles.overlay}><View style={styles.modal}>
          <Text style={styles.modalTitle}>Editar cargo e liderança</Text>
          <Seletor label="Perfil" valor={perfil}
            opcoes={[['FUNCIONARIO', 'Funcionário'], ['GESTOR', 'Gestor']]}
            onChange={(valor) => setPerfil(valor as Perfil)} />
          <Seletor label="Departamento" valor={departamentoId}
            opcoes={departamentos.map((item) => [String(item.id), item.nome])}
            onChange={(valor) => {
              setDepartamentoId(valor);
              setCargoId('');
            }} />
          <Seletor label="Cargo" valor={cargoId}
            opcoes={cargosDisponiveis.map((item) => [String(item.id), item.nome])}
            onChange={setCargoId} />
          <Seletor label="Líder direto" valor={gestorId}
            opcoes={funcionarios.filter((item) => item.id !== funcionario.id)
              .map((item) => [String(item.id), item.nome])}
            onChange={setGestorId} />
          <Rodape onCancelar={() => setModal(null)} onConfirmar={async () => {
            await onAtualizarProfissional(funcionario.id, {
              perfil,
              departamentoId: numeroOuNulo(departamentoId),
              cargoId: numeroOuNulo(cargoId),
              gestorId: numeroOuNulo(gestorId),
            });
            setModal(null);
          }} label="Salvar alterações" />
        </View></View>
      </Modal>

      <Modal visible={modal === 'revisao'} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <View style={styles.overlay}><View style={styles.modal}>
          <Text style={styles.modalTitle}>Pedir correções</Text>
          <Text style={styles.subtitle}>A pré-admissão volta para o colaborador com esta orientação.</Text>
          <TextInput style={[styles.input, styles.textarea]} value={motivo} onChangeText={setMotivo}
            multiline maxLength={255} placeholder="Descreva o que precisa ser corrigido"
            placeholderTextColor={color.placeholder} />
          <Rodape danger onCancelar={() => setModal(null)} onConfirmar={() => {
            if (!motivo.trim()) return;
            onReprovar(funcionario.id, motivo.trim());
            setMotivo('');
            setModal(null);
          }} label="Enviar para correção" />
        </View></View>
      </Modal>

      <Modal visible={modal === 'senha'} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <View style={styles.overlay}><View style={styles.modal}>
          <Text style={styles.modalTitle}>Redefinir senha</Text>
          <TextInput style={styles.input} value={senha} onChangeText={setSenha}
            secureTextEntry placeholder="Nova senha, mínimo de 6 caracteres"
            placeholderTextColor={color.placeholder} />
          <Rodape onCancelar={() => setModal(null)} onConfirmar={async () => {
            if (senha.length < 6) return;
            await onRedefinirSenha(funcionario.id, senha);
            setSenha('');
            setModal(null);
          }} label="Redefinir senha" />
        </View></View>
      </Modal>

      <Modal visible={modal === 'desligar'} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <View style={styles.overlay}><View style={styles.modal}>
          <Text style={styles.modalTitle}>Desligar {funcionario.nome}?</Text>
          <Text style={styles.subtitle}>O acesso é encerrado imediatamente. O histórico continua disponível em Desligados.</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={motivoDesligamento}
            onChangeText={setMotivoDesligamento}
            multiline
            maxLength={255}
            placeholder="Informe o motivo do desligamento"
            placeholderTextColor={color.placeholder}
          />
          <Rodape danger onCancelar={() => setModal(null)} onConfirmar={async () => {
            if (!motivoDesligamento.trim()) return;
            await onDesligar(funcionario.id, motivoDesligamento.trim());
            setMotivoDesligamento('');
            setModal(null);
          }} label="Confirmar desligamento" />
        </View></View>
      </Modal>
    </View>
  );
}

function Seletor({ label, valor, opcoes, onChange }: {
  label: string; valor: string; opcoes: string[][]; onChange: (valor: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.selector} onPress={() => setAberto(true)}>
        <Text style={styles.selectorText}>{opcoes.find(([id]) => id === valor)?.[1] ?? 'Não informado'}</Text>
      </Pressable>
      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <View style={styles.overlay}><View style={styles.options}>
          <Text style={styles.modalTitle}>{label}</Text>
          <ScrollView>
            <Pressable style={styles.option} onPress={() => { onChange(''); setAberto(false); }}>
              <Text style={styles.optionText}>Não informado</Text>
            </Pressable>
            {opcoes.map(([id, texto]) => (
              <Pressable key={id} style={[styles.option, id === valor && styles.optionActive]} onPress={() => { onChange(id); setAberto(false); }}>
                <Text style={styles.optionText}>{texto}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View></View>
      </Modal>
    </View>
  );
}

function Botao({ label, onPress, tom = 'secundario' }: {
  label: string;
  onPress: () => void;
  tom?: 'primario' | 'secundario' | 'perigo';
}) {
  const caixa = tom === 'primario' ? styles.buttonPrimary : tom === 'perigo' ? styles.buttonQuiet : styles.button;
  const texto = tom === 'primario' ? styles.buttonTextOnColor : tom === 'perigo' ? styles.buttonTextDanger : styles.buttonText;
  return (
    <Pressable style={({ pressed }) => [caixa, pressed && { opacity: 0.85 }]} onPress={onPress} accessibilityRole="button">
      <Text style={texto}>{label}</Text>
    </Pressable>
  );
}

function Rodape({ label, onCancelar, onConfirmar, danger }: {
  label: string; onCancelar: () => void; onConfirmar: () => void; danger?: boolean;
}) {
  return (
    <View style={styles.footer}>
      <Pressable style={styles.cancel} onPress={onCancelar}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
      <Pressable style={[styles.confirm, danger && styles.danger]} onPress={onConfirmar}>
        <Text style={styles.buttonTextOnColor}>{label}</Text>
      </Pressable>
    </View>
  );
}

function numeroOuNulo(valor: string): number | null {
  return valor ? Number(valor) : null;
}

function formatarData(valor: string): string {
  return new Date(valor).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const styles = estilos(() => ({
  stack: { gap: 16 },
  card: ui.section,
  aviso: { backgroundColor: color.warningSoft, borderWidth: 1, borderColor: color.warningLine, borderRadius: 12, padding: 20, gap: 6 },
  avisoTitulo: { color: color.ink, ...type.lead, fontWeight: '600' },
  avisoTexto: { color: color.inkSoft, ...type.body, marginBottom: 6 },
  title: ui.title,
  subtitle: ui.subtitle,
  actions: ui.actionsRow,
  button: { ...ui.btn, ...ui.btnSecondary },
  buttonPrimary: { ...ui.btn, ...ui.btnPrimary },
  buttonQuiet: { ...ui.btn, ...ui.btnQuiet },
  danger: { backgroundColor: color.dangerStrong, borderWidth: 0 },
  buttonText: ui.btnText,
  buttonTextOnColor: ui.btnTextOnColor,
  buttonTextDanger: { ...ui.btnText, color: color.danger },
  spacer: { flex: 1 },
  consentimento: ui.row,
  consentimentoText: ui.rowText,
  itemTitle: ui.rowTitle,
  empty: ui.empty,
  overlay: ui.overlay,
  modal: ui.modal,
  options: { ...ui.modal, maxWidth: 440, maxHeight: '75%', gap: 8 },
  modalTitle: ui.modalTitle,
  field: ui.field,
  label: ui.label,
  selector: ui.input,
  selectorText: { color: color.ink, ...type.body },
  option: { borderTopWidth: 1, borderTopColor: color.line, paddingVertical: 12, paddingHorizontal: 4 },
  optionActive: { backgroundColor: color.brandSoft },
  optionText: { color: color.ink, ...type.body },
  input: ui.input,
  textarea: ui.textarea,
  footer: ui.modalActions,
  cancel: { ...ui.btn, ...ui.btnSecondary },
  cancelText: ui.btnText,
  confirm: { ...ui.btn, ...ui.btnPrimary },
}));
