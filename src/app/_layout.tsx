import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
  useFonts,
} from '@expo-google-fonts/archivo';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Text, TextInput, type TextInputProps, type TextProps } from 'react-native';

import { carregarModoSalvo } from '@/components/AlternarTema';
import { color, fontFamily, useModo } from '@/constants/theme';
import '@/global.css';

const text = Text as typeof Text & { defaultProps?: TextProps };
const textInput = TextInput as typeof TextInput & { defaultProps?: TextInputProps };
const estiloTextoOriginal = text.defaultProps?.style;
const estiloCampoOriginal = textInput.defaultProps?.style;

/** Fonte e cor de texto padrão; refeito a cada troca de tema (sem acumular estilos). */
function applyDefaultFont() {
  text.defaultProps = { ...text.defaultProps, style: [{ fontFamily, color: color.ink }, estiloTextoOriginal] };
  textInput.defaultProps = { ...textInput.defaultProps, style: [{ fontFamily }, estiloCampoOriginal] };
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
  const [temaCarregado, setTemaCarregado] = useState(false);
  const modo = useModo();

  useEffect(() => {
    carregarModoSalvo().finally(() => setTemaCarregado(true));
  }, []);

  if (!fontsLoaded || !temaCarregado) return null;

  applyDefaultFont();

  // A chave remonta as telas na troca de tema, para todos os estilos lerem a nova paleta.
  return (
    <>
      <StatusBar style={modo === 'escuro' ? 'light' : 'dark'} />
      <Stack
        key={modo}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: color.canvas },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
      </Stack>
    </>
  );
}
