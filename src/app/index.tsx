import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { isAxiosError } from 'axios';
import { router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';

import { login } from '@/api/auth';
import { ApiError } from '@/api/types';
import { color, radius, type } from '@/constants/theme';

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState('admin@korainc.com.br');
  const [senha, setSenha] = useState('Admin@123');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [focado, setFocado] = useState<'email' | 'senha' | null>(null);
  const amplo = width >= 900;

  async function entrar() {
    if (!email.trim() || !senha) {
      setErro('Preencha o e-mail e a senha para entrar.');
      return;
    }
    setErro(null);
    setCarregando(true);
    try {
      await login(email.trim(), senha);
      router.replace('/home');
    } catch (e) {
      if (isAxiosError(e)) {
        const data = e.response?.data as ApiError | undefined;
        setErro(
          data?.message
            ?? 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
        );
      } else {
        setErro('Algo impediu o login. Tente novamente em instantes.');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.flex, amplo && styles.linha]}>
          {amplo ? (
            <View style={styles.painelMarca}>
              <Marca />
              <Text style={styles.painelTexto}>
                Documentos, holerites, jornada e avaliações da sua equipe em um só lugar.
              </Text>
              <Text style={styles.painelRodape}>Plataforma de gestão de pessoas</Text>
            </View>
          ) : null}

          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.formArea, !amplo && styles.formAreaCompacta]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.form}>
              {!amplo ? <Marca compacta /> : null}

              <View style={styles.cabecalho}>
                <Text style={styles.titulo}>Entrar</Text>
                <Text style={styles.subtitulo}>
                  Use o e-mail corporativo e a senha que você recebeu do RH.
                </Text>
              </View>

              <View style={styles.campo}>
                <Text style={styles.label} nativeID="label-email">E-mail corporativo</Text>
                <TextInput
                  style={[styles.input, focado === 'email' && styles.inputFocado]}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocado('email')}
                  onBlur={() => setFocado(null)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder="nome@empresa.com.br"
                  placeholderTextColor={color.placeholder}
                  accessibilityLabelledBy="label-email"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.campo}>
                <Text style={styles.label} nativeID="label-senha">Senha</Text>
                <View style={[styles.input, styles.inputSenha, focado === 'senha' && styles.inputFocado]}>
                  <TextInput
                    style={styles.inputSenhaTexto}
                    value={senha}
                    onChangeText={setSenha}
                    onFocus={() => setFocado('senha')}
                    onBlur={() => setFocado(null)}
                    secureTextEntry={!senhaVisivel}
                    autoComplete="current-password"
                    placeholder="Sua senha"
                    placeholderTextColor={color.placeholder}
                    accessibilityLabelledBy="label-senha"
                    onSubmitEditing={entrar}
                    returnKeyType="go"
                  />
                  <Pressable
                    onPress={() => setSenhaVisivel((v) => !v)}
                    style={styles.olho}
                    accessibilityRole="button"
                    accessibilityLabel={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
                    hitSlop={8}
                  >
                    {senhaVisivel
                      ? <EyeOff color={color.muted} size={18} strokeWidth={2} />
                      : <Eye color={color.muted} size={18} strokeWidth={2} />}
                  </Pressable>
                </View>
              </View>

              {erro ? (
                <Text style={styles.erro} accessibilityRole="alert">{erro}</Text>
              ) : null}

              <Pressable
                style={({ pressed }) => [
                  styles.botao,
                  pressed && styles.botaoPressionado,
                  carregando && styles.botaoCarregando,
                ]}
                onPress={entrar}
                disabled={carregando}
                accessibilityRole="button"
                accessibilityState={{ busy: carregando }}
              >
                {carregando ? (
                  <ActivityIndicator color={color.onBrand} />
                ) : (
                  <Text style={styles.botaoTexto}>Entrar</Text>
                )}
              </Pressable>

              <Text style={styles.ajuda}>
                Esqueceu a senha? Peça ao RH para redefinir seu acesso.
              </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <View style={styles.marca}>
      <View style={[styles.marcaSelo, compacta && styles.marcaSeloCompacto]}>
        <Image
          source={require('../../assets/images/logo-conformia.png')}
          style={styles.marcaImagem}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
      <Text style={[styles.marcaNome, compacta && styles.marcaNomeCompacto]}>Conformia</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: color.surface,
  },
  flex: {
    flex: 1,
  },
  linha: {
    flexDirection: 'row',
  },
  painelMarca: {
    width: '42%',
    maxWidth: 560,
    backgroundColor: color.brandDeep,
    paddingHorizontal: 56,
    paddingVertical: 48,
    justifyContent: 'space-between',
  },
  painelTexto: {
    maxWidth: 400,
    color: color.onBrand,
    ...type.display,
    fontWeight: '500',
  },
  painelRodape: {
    color: color.onBrandMuted,
    ...type.small,
  },
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  marcaSelo: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcaSeloCompacto: {
    backgroundColor: color.brand,
  },
  marcaImagem: {
    width: 24,
    height: 24,
  },
  marcaNome: {
    color: color.onBrand,
    ...type.lead,
    fontWeight: '600',
  },
  marcaNomeCompacto: {
    color: color.ink,
  },
  formArea: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  formAreaCompacta: {
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  form: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    gap: 20,
  },
  cabecalho: {
    gap: 6,
    marginBottom: 4,
  },
  titulo: {
    color: color.ink,
    ...type.heading,
    fontWeight: '600',
  },
  subtitulo: {
    color: color.muted,
    ...type.body,
  },
  campo: {
    gap: 6,
  },
  label: {
    color: color.inkSoft,
    ...type.small,
    fontWeight: '500',
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: color.lineStrong,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: color.ink,
    backgroundColor: color.surface,
    ...type.body,
  },
  inputFocado: {
    borderColor: color.brand,
  },
  inputSenha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0,
    paddingRight: 4,
  },
  inputSenhaTexto: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 10,
    color: color.ink,
    ...type.body,
  },
  olho: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  erro: {
    color: color.danger,
    backgroundColor: color.dangerSoft,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...type.small,
  },
  botao: {
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  botaoPressionado: {
    backgroundColor: color.brandStrong,
  },
  botaoCarregando: {
    opacity: 0.8,
  },
  botaoTexto: {
    color: color.onBrand,
    ...type.body,
    fontWeight: '600',
  },
  ajuda: {
    color: color.muted,
    ...type.small,
  },
});
