import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
  useFonts,
} from '@expo-google-fonts/archivo';
import { Stack } from 'expo-router';
import { Text, TextInput, type TextInputProps, type TextProps } from 'react-native';

import { color, fontFamily } from '@/constants/theme';
import '@/global.css';

function applyDefaultFont() {
  const text = Text as typeof Text & { defaultProps?: TextProps };
  const textInput = TextInput as typeof TextInput & { defaultProps?: TextInputProps };

  text.defaultProps = text.defaultProps ?? {};
  text.defaultProps.style = [{ fontFamily, color: color.ink }, text.defaultProps.style];

  textInput.defaultProps = textInput.defaultProps ?? {};
  textInput.defaultProps.style = [{ fontFamily }, textInput.defaultProps.style];
}

export default function RootLayout() {
  // No web, a Archivo vem do Google Fonts (+html.tsx) com todos os pesos numa única família;
  // no app nativo, os arquivos são carregados aqui.
  const [fontsLoaded] = useFonts({
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
  });

  if (!fontsLoaded) return null;

  applyDefaultFont();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color.canvas },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="home" />
    </Stack>
  );
}
