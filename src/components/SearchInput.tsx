import { Search } from 'lucide-react-native';
import { useState } from 'react';
import {
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { color, estilos, radius, type } from '@/constants/theme';

type SearchInputProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export function SearchInput({
  containerStyle,
  inputStyle,
  placeholderTextColor = color.placeholder,
  onFocus,
  onBlur,
  ...props
}: SearchInputProps) {
  const [focado, setFocado] = useState(false);
  return (
    <View style={[styles.container, focado && styles.containerFocado, containerStyle]}>
      <Search color={color.muted} size={17} strokeWidth={2} />
      <TextInput
        accessibilityRole="search"
        {...props}
        onFocus={(e) => {
          setFocado(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocado(false);
          onBlur?.(e);
        }}
        placeholderTextColor={placeholderTextColor}
        style={[styles.input, inputStyle]}
      />
    </View>
  );
}

const styles = estilos(() => ({
  container: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: color.lineStrong,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    paddingHorizontal: 12,
  },
  containerFocado: {
    borderColor: color.brand,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 10,
    color: color.ink,
    ...type.body,
  },
}));
