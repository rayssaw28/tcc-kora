import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { ui } from '@/components/ui';
import { color, type } from '@/constants/theme';

export function CalendarDateInput({
  label,
  required,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const selected = parseIsoDate(value);
  const [open, setOpen] = useState(false);
  const [selectingYear, setSelectingYear] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selected ?? new Date()));
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 121 }, (_, index) => currentYear + 20 - index);
  }, []);
  const days = buildMonth(currentMonth);

  function openCalendar() {
    setCurrentMonth(startOfMonth(selected ?? new Date()));
    setSelectingYear(false);
    setOpen(true);
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}{required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <Pressable style={styles.selector} onPress={openCalendar}>
        <Text style={[styles.selectorText, !value && styles.placeholder]}>
          {formatBrazilianDate(value) || 'Selecionar data'}
        </Text>
        <CalendarDays color={color.muted} size={18} strokeWidth={2} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.calendarHeader}>
              <Pressable
                accessibilityLabel="Mês anterior"
                style={styles.calendarNavButton}
                onPress={() => setCurrentMonth(moveMonth(currentMonth, -1))}
              >
                <ChevronLeft color={color.inkSoft} size={20} strokeWidth={2.2} />
              </Pressable>
              <Pressable onPress={() => setSelectingYear((current) => !current)}>
                <Text style={styles.modalTitle}>{monthLabel(currentMonth)}</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Próximo mês"
                style={styles.calendarNavButton}
                onPress={() => setCurrentMonth(moveMonth(currentMonth, 1))}
              >
                <ChevronRight color={color.inkSoft} size={20} strokeWidth={2.2} />
              </Pressable>
            </View>

            {selectingYear ? (
              <ScrollView style={styles.yearList}>
                {years.map((year) => (
                  <Pressable
                    key={year}
                    style={[
                      styles.yearOption,
                      year === currentMonth.getFullYear() && styles.yearOptionActive,
                    ]}
                    onPress={() => {
                      setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
                      setSelectingYear(false);
                    }}
                  >
                    <Text style={styles.yearOptionText}>{year}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <>
                <View style={styles.week}>
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
                    <Text key={`${day}-${index}`} style={styles.weekDay}>{day}</Text>
                  ))}
                </View>
                <View style={styles.calendarGrid}>
                  {days.map((day, index) => {
                    if (!day) {
                      return <View key={`empty-${index}`} style={styles.day} />;
                    }
                    const isoDate = toIsoDate(day);
                    const active = value === isoDate;
                    return (
                      <Pressable
                        key={isoDate}
                        style={[styles.day, active && styles.dayActive]}
                        onPress={() => {
                          onChange(isoDate);
                          setOpen(false);
                        }}
                      >
                        <Text style={[styles.dayText, active && styles.dayTextActive]}>
                          {day.getDate()}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            <Pressable style={styles.closeButton} onPress={() => setOpen(false)}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
    ? date
    : null;
}

function formatBrazilianDate(value: string): string {
  const date = parseIsoDate(value);
  if (!date) return '';
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function moveMonth(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function monthLabel(date: Date): string {
  const label = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function buildMonth(date: Date): (Date | null)[] {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return [
    ...Array.from({ length: firstDay.getDay() }, () => null),
    ...Array.from(
      { length: lastDay },
      (_, index) => new Date(date.getFullYear(), date.getMonth(), index + 1),
    ),
  ];
}

const styles = StyleSheet.create({
  field: { ...ui.field, flex: 1, minWidth: 160 },
  label: ui.label,
  required: ui.required,
  selector: { ...ui.input, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  selectorText: { color: color.ink, ...type.body },
  placeholder: { color: color.placeholder },
  overlay: ui.overlay,
  modal: { ...ui.modal, maxWidth: 380, maxHeight: '82%', gap: 12, padding: 20 },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calendarNavButton: ui.iconButtonBordered,
  modalTitle: { color: color.ink, ...type.lead, fontWeight: '600' },
  yearList: { maxHeight: 350 },
  yearOption: { minHeight: 44, borderTopWidth: 1, borderTopColor: color.line, paddingHorizontal: 10, paddingVertical: 10, alignItems: 'center' },
  yearOptionActive: { backgroundColor: color.brandSoft },
  yearOptionText: { color: color.ink, ...type.body },
  week: { flexDirection: 'row' },
  weekDay: { width: '14.285%', textAlign: 'center', color: color.muted, ...type.caption, fontWeight: '600' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  day: { width: '14.285%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 99 },
  dayActive: { backgroundColor: color.brand },
  dayText: { color: color.ink, ...type.small, fontWeight: '500' },
  dayTextActive: { color: color.onBrand, fontWeight: '600' },
  closeButton: { ...ui.btn, ...ui.btnSecondary, alignSelf: 'flex-end' },
  closeButtonText: ui.btnText,
});
