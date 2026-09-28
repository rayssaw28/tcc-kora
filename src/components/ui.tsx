import { Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { color, radius, type } from '@/constants/theme';

/**
 * Peças visuais compartilhadas pelas seções do app.
 * Hierarquia: seção (cartão branco com borda) > linhas separadas por divisores.
 * Nada de cartão dentro de cartão.
 */
export const ui = StyleSheet.create({
  // Seção
  section: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.line,
    padding: 20,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    color: color.ink,
    ...type.lead,
    fontWeight: '600',
  },
  subtitle: {
    color: color.muted,
    ...type.small,
  },
  groupTitle: {
    color: color.muted,
    ...type.small,
    fontWeight: '600',
    marginTop: 8,
  },
  empty: {
    color: color.muted,
    ...type.body,
    paddingVertical: 4,
  },

  // Linhas de lista (separadas por divisor, sem caixa)
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: color.line,
  },
  rowStack: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: color.line,
    gap: 8,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowTitle: {
    color: color.ink,
    ...type.body,
    fontWeight: '600',
  },
  rowMeta: {
    color: color.muted,
    ...type.small,
  },
  rowBody: {
    color: color.text,
    ...type.small,
  },
  value: {
    color: color.ink,
    ...type.body,
    fontWeight: '600',
  },

  // Botões
  btn: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  btnSm: {
    minHeight: 32,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  btnPrimary: {
    backgroundColor: color.brand,
  },
  btnDanger: {
    backgroundColor: color.dangerStrong,
  },
  btnSecondary: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.lineStrong,
  },
  btnQuiet: {
    backgroundColor: 'transparent',
  },
  btnTextOnColor: {
    color: color.onBrand,
    ...type.body,
    fontWeight: '600',
  },
  btnText: {
    color: color.ink,
    ...type.body,
    fontWeight: '600',
  },
  btnTextSm: {
    color: color.ink,
    ...type.small,
    fontWeight: '600',
  },
  btnTextSmOnColor: {
    color: color.onBrand,
    ...type.small,
    fontWeight: '600',
  },
  btnTextBrand: {
    color: color.brand,
    ...type.small,
    fontWeight: '600',
  },
  btnTextDanger: {
    color: color.danger,
    ...type.small,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.55,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  link: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  linkText: {
    color: color.brand,
    ...type.small,
    fontWeight: '600',
  },

  // Status
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    ...type.caption,
    fontWeight: '600',
  },
  badgeOk: { backgroundColor: color.brandSoft },
  badgeOkText: { color: color.brandStrong },
  badgeWarn: { backgroundColor: color.warningSoft },
  badgeWarnText: { color: color.warning },
  badgeBad: { backgroundColor: color.dangerSoft },
  badgeBadText: { color: color.danger },
  badgeNeutral: { backgroundColor: color.sunken },
  badgeNeutralText: { color: color.inkSoft },

  // Formulários
  field: {
    gap: 6,
  },
  label: {
    color: color.inkSoft,
    ...type.small,
    fontWeight: '500',
  },
  required: {
    color: color.dangerStrong,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: color.lineStrong,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: color.ink,
    backgroundColor: color.surface,
    ...type.body,
  },
  textarea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  error: {
    color: color.danger,
    backgroundColor: color.dangerSoft,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...type.small,
  },
  help: {
    color: color.muted,
    ...type.small,
  },

  // Chips de seleção
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    minHeight: 32,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: color.lineStrong,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: color.surface,
  },
  chipActive: {
    backgroundColor: color.brandSoft,
    borderColor: color.brand,
  },
  chipText: {
    color: color.inkSoft,
    ...type.small,
    fontWeight: '500',
  },
  chipTextActive: {
    color: color.brandStrong,
    fontWeight: '600',
  },

  // Abas segmentadas
  segmented: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    padding: 4,
    borderRadius: radius.md + 2,
    backgroundColor: color.sunken,
    alignSelf: 'flex-start',
  },
  segment: {
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: color.surface,
  },
  segmentText: {
    color: color.muted,
    ...type.small,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: color.ink,
    fontWeight: '600',
  },

  // Modais
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(23,33,28,0.48)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 24,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalTitle: {
    color: color.ink,
    ...type.title,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonBordered: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: color.lineStrong,
    backgroundColor: color.surface,
  },
});

/** Botão principal de cabeçalho de seção: sempre com rótulo, nunca só "+". */
export function AddButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        ui.btnSm,
        ui.btnSecondary,
        { alignSelf: 'flex-start' },
        pressed && { backgroundColor: color.sunken },
      ]}
    >
      <Plus color={color.brand} size={16} strokeWidth={2.4} />
      <Text style={ui.btnTextSm}>{label}</Text>
    </Pressable>
  );
}

export type Tom = 'ok' | 'warn' | 'bad' | 'neutral';

export function Badge({ label, tom }: { label: string; tom: Tom }) {
  const box = tom === 'ok' ? ui.badgeOk : tom === 'warn' ? ui.badgeWarn : tom === 'bad' ? ui.badgeBad : ui.badgeNeutral;
  const txt = tom === 'ok' ? ui.badgeOkText : tom === 'warn' ? ui.badgeWarnText : tom === 'bad' ? ui.badgeBadText : ui.badgeNeutralText;
  return (
    <View style={[ui.badge, box]}>
      <Text style={[ui.badgeText, txt]}>{label}</Text>
    </View>
  );
}
