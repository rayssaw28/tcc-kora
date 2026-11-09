import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { isAxiosError } from 'axios';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { CircleAlert, Eye, EyeOff } from 'lucide-react-native';

import { login } from '@/api/auth';
import { ApiError } from '@/api/types';
import { AlternarTema } from '@/components/AlternarTema';
import { Brilho } from '@/components/Brilho';
import { Badge, type Tom } from '@/components/ui';
import { RH_CONTATO_EMAIL } from '@/config';
import { color, elevacao, estilos, radius, type } from '@/constants/theme';

// Conta da demonstração: só existe no build de desenvolvimento, nunca em produção.
const CONTA_DEMO = __DEV__ ? { email: 'admin@korainc.com.br', senha: 'Admin@123' } : null;

// Recorte ilustrativo do mural exibido no painel lateral (dados fictícios).
const MURAL_EXEMPLO: { titulo: string; status: string; tom: Tom }[] = [
  { titulo: 'Comprovante de residência', status: 'Aprovado', tom: 'ok' },
  { titulo: 'Holerite de outubro', status: 'Disponível', tom: 'info' },
  { titulo: 'Atestado médico', status: 'Em análise', tom: 'warn' },
];

// Rascunho do formulário. A troca de tema recria as telas (a `key` do _layout.tsx), e isso
// não pode apagar o que a pessoa digitou. Fica só em memória, nunca em disco.
const rascunho = { email: '', senha: '', ajudaAberta: false };

type ErroLogin = {
  mensagem: string;
  campo: 'email' | 'senha' | 'ambos' | null;
};

export default function LoginScreen() {
  const { width, height } = useWindowDimensions();
  const [email, setEmail] = useState(rascunho.email);
  const [senha, setSenha] = useState(rascunho.senha);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [ajudaAberta, setAjudaAberta] = useState(rascunho.ajudaAberta);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<ErroLogin | null>(null);
  const [focado, setFocado] = useState<'email' | 'senha' | null>(null);
  const emailRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);
  const rolagemRef = useRef<ScrollView>(null);
  const amplo = width >= 900;
  // Em telas baixas o recorte do mural não cabe no painel; fica só a frase.
  const mostrarMural = height >= 680;

  function alterarEmail(valor: string) {
    rascunho.email = valor;
    setEmail(valor);
    setErro(null);
  }

  function alterarSenha(valor: string) {
    rascunho.senha = valor;
    setSenha(valor);
    setErro(null);
  }

  function definirAjuda(aberta: boolean) {
    rascunho.ajudaAberta = aberta;
    setAjudaAberta(aberta);
  }

  /** Mostra o erro e leva o foco ao campo que precisa de atenção. */
  function falhar(e: ErroLogin) {
    setErro(e);
    (e.campo === 'email' ? emailRef : e.campo ? senhaRef : null)?.current?.focus();
  }

  async function entrar() {
    const emailLimpo = email.trim();
    if (!emailLimpo) {
      falhar({ mensagem: 'Informe o e-mail corporativo.', campo: 'email' });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(emailLimpo)) {
      falhar({ mensagem: 'Confira o e-mail: ele deve ter o formato nome@empresa.com.br.', campo: 'email' });
      return;
    }
    if (!senha) {
      falhar({ mensagem: 'Informe a senha.', campo: 'senha' });
      return;
    }
    setErro(null);
    setCarregando(true);
    try {
      await login(emailLimpo, senha);
      rascunho.email = '';
      rascunho.senha = '';
      rascunho.ajudaAberta = false;
      router.replace('/home');
    } catch (e) {
      if (!isAxiosError(e)) {
        falhar({ mensagem: 'Algo impediu o login. Tente novamente em instantes.', campo: null });
      } else if (!e.response) {
        falhar({
          mensagem: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
          campo: null,
        });
      } else if (e.response.status === 401) {
        falhar({
          mensagem: 'E-mail ou senha incorretos. Confira e tente de novo. Se esqueceu a senha, veja as instruções abaixo.',
          campo: 'ambos',
        });
        // O caminho de recuperação é um só: o link abaixo do botão, aberto e à vista.
        definirAjuda(true);
        setTimeout(() => rolagemRef.current?.scrollToEnd({ animated: true }), 80);
      } else if (e.response.status >= 500) {
        falhar({ mensagem: 'O sistema está indisponível no momento. Tente de novo em instantes.', campo: null });
      } else {
        const data = e.response.data as ApiError | undefined;
        falhar({ mensagem: data?.message ?? 'Não foi possível entrar. Tente novamente.', campo: null });
      }
    } finally {
      setCarregando(false);
    }
  }

  const erroNoEmail = erro?.campo === 'email' || erro?.campo === 'ambos';
  const erroNaSenha = erro?.campo === 'senha' || erro?.campo === 'ambos';
  // Erros de um campo aparecem junto dele; rede, servidor e credenciais ficam na faixa geral.
  const erroGeral = erro && (erro.campo === 'ambos' || erro.campo === null) ? erro : null;

  return (
    <SafeAreaView style={styles.safe}>
      <Head>
        <title>Entrar · Conformia</title>
      </Head>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.flex, amplo && styles.linha]}>
          {amplo ? (
            <View style={styles.painelMarca}>
              <Brilho variante="claro" />
              <View style={styles.painelTopo}>
                <Marca />
                <AlternarTema />
              </View>
              <View style={styles.painelCorpo}>
                <Text style={styles.painelTexto}>
                  Holerites, documentos e pendências sem precisar pedir ao RH.
                </Text>
                {mostrarMural ? (
                  <>
                    <View
                      style={styles.mural}
                      aria-hidden
                      importantForAccessibility="no-hide-descendants"
                    >
                      <Text style={styles.muralTitulo}>Seu mural</Text>
                      {MURAL_EXEMPLO.map((item) => (
                        <View key={item.titulo} style={styles.muralLinha}>
                          <Text style={styles.muralItem} numberOfLines={1}>{item.titulo}</Text>
                          <Badge label={item.status} tom={item.tom} />
                        </View>
                      ))}
                    </View>
                    <Text
                      style={styles.painelLegenda}
                      aria-hidden
                      importantForAccessibility="no-hide-descendants"
                    >
                      Exemplo ilustrativo, com dados fictícios.
                    </Text>
                  </>
                ) : null}
              </View>
            </View>
          ) : null}

          <ScrollView
            ref={rolagemRef}
            style={styles.flex}
            contentContainerStyle={[styles.formArea, !amplo && styles.formAreaCompacta]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.form}>
              {!amplo ? (
                <View style={styles.topoCompacto}>
                  <Marca />
                  <AlternarTema />
                </View>
              ) : null}

              <View style={styles.cabecalho}>
                <Text style={styles.titulo} accessibilityRole="header" aria-level={1}>Entrar</Text>
                <Text style={styles.subtitulo}>
                  Use o e-mail corporativo e a senha que você recebeu do RH.
                </Text>
              </View>

              <View style={styles.campo}>
                <Text style={styles.label} nativeID="label-email">E-mail corporativo</Text>
                <TextInput
                  ref={emailRef}
                  style={[
                    styles.input,
                    focado === 'email' && styles.inputFocado,
                    erroNoEmail && styles.inputErro,
                  ]}
                  value={email}
                  onChangeText={alterarEmail}
                  onFocus={() => setFocado('email')}
                  onBlur={() => setFocado(null)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder="nome@empresa.com.br"
                  placeholderTextColor={color.placeholder}
                  accessibilityLabelledBy="label-email"
                  aria-invalid={erroNoEmail}
                  aria-describedby={erro?.campo === 'email' ? 'erro-email' : undefined}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => senhaRef.current?.focus()}
                />
                {erro?.campo === 'email' ? <ErroCampo id="erro-email" mensagem={erro.mensagem} /> : null}
              </View>

              <View style={styles.campo}>
                <Text style={styles.label} nativeID="label-senha">Senha</Text>
                <View
                  style={[
                    styles.input,
                    styles.inputSenha,
                    focado === 'senha' && styles.inputFocado,
                    erroNaSenha && styles.inputErro,
                  ]}
                >
                  <TextInput
                    ref={senhaRef}
                    style={styles.inputSenhaTexto}
                    value={senha}
                    onChangeText={alterarSenha}
                    aria-invalid={erroNaSenha}
                    aria-describedby={erro?.campo === 'senha' ? 'erro-senha' : undefined}
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
                {erro?.campo === 'senha' ? <ErroCampo id="erro-senha" mensagem={erro.mensagem} /> : null}
              </View>

              {erroGeral ? (
                <View style={styles.erro} accessibilityRole="alert">
                  <View style={styles.erroIcone}>
                    <CircleAlert color={color.danger} size={18} strokeWidth={2} />
                  </View>
                  <View style={styles.erroCorpo}>
                    <Text style={styles.erroTexto}>{erroGeral.mensagem}</Text>
                  </View>
                </View>
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

              <View style={styles.ajudaBloco}>
                <Pressable
                  onPress={() => definirAjuda(!ajudaAberta)}
                  style={styles.ajudaLink}
                  accessibilityRole="button"
                  aria-expanded={ajudaAberta}
                  hitSlop={8}
                >
                  <Text style={styles.ajudaLinkTexto}>Esqueci minha senha</Text>
                </Pressable>
                {ajudaAberta ? (
                  <View style={styles.ajudaPainel}>
                    <Text style={styles.ajudaTexto}>
                      O RH redefine o seu acesso e informa uma senha temporária, que você troca no
                      próximo login.
                    </Text>
                    {RH_CONTATO_EMAIL ? (
                      <Pressable
                        onPress={() => Linking.openURL(`mailto:${RH_CONTATO_EMAIL}`)}
                        style={styles.ajudaLink}
                        accessibilityRole="link"
                      >
                        <Text style={styles.ajudaLinkTexto}>Escrever para {RH_CONTATO_EMAIL}</Text>
                      </Pressable>
                    ) : (
                      <Text style={styles.ajudaTexto}>
                        Fale com o RH da sua empresa, por e-mail ou pessoalmente.
                      </Text>
                    )}
                    <Text style={styles.ajudaTexto}>
                      Se você é do RH, peça a outra pessoa com acesso administrativo, ou ao
                      administrador do sistema, para redefinir a sua senha.
                    </Text>
                  </View>
                ) : null}
              </View>

              {CONTA_DEMO ? (
                <Pressable
                  onPress={() => {
                    alterarEmail(CONTA_DEMO.email);
                    alterarSenha(CONTA_DEMO.senha);
                  }}
                  style={styles.ajudaLink}
                  accessibilityRole="button"
                >
                  <Text style={styles.demoTexto}>Preencher com a conta de demonstração</Text>
                </Pressable>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Mensagem de validação junto do campo; `id` liga o texto ao campo via aria-describedby. */
function ErroCampo({ id, mensagem }: { id: string; mensagem: string }) {
  return (
    <View style={styles.erroCampo} accessibilityRole="alert">
      <CircleAlert color={color.danger} size={14} strokeWidth={2} />
      <Text style={styles.erroCampoTexto} nativeID={id}>{mensagem}</Text>
    </View>
  );
}

function Marca() {
  return (
    <View style={styles.marca}>
      <View style={styles.marcaSelo}>
        <Image
          source={require('../../assets/images/logo-conformia.png')}
          style={styles.marcaImagem}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
      <Text style={styles.marcaNome}>Conformia</Text>
    </View>
  );
}

const styles = estilos(() => ({
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
  painelTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topoCompacto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  painelMarca: {
    width: '42%',
    maxWidth: 560,
    backgroundColor: color.brandSoft,
    overflow: 'hidden',
    paddingHorizontal: 48,
    paddingVertical: 48,
    justifyContent: 'space-between',
  },
  painelCorpo: {
    gap: 24,
  },
  painelTexto: {
    maxWidth: 400,
    color: color.ink,
    ...type.display,
    fontWeight: '500',
  },
  painelLegenda: {
    color: color.text,
    ...type.small,
  },
  mural: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.line,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    ...elevacao.cartao,
  },
  muralTitulo: {
    color: color.ink,
    ...type.lead,
    fontWeight: '600',
    marginBottom: 4,
  },
  muralLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: color.line,
  },
  muralItem: {
    flex: 1,
    minWidth: 0,
    color: color.ink,
    ...type.body,
    fontWeight: '600',
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
    backgroundColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcaImagem: {
    width: 24,
    height: 24,
  },
  marcaNome: {
    color: color.ink,
    ...type.lead,
    fontWeight: '600',
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
  inputErro: {
    borderColor: color.danger,
  },
  erro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: color.dangerSoft,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  erroIcone: {
    marginTop: 2,
  },
  erroCorpo: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  erroTexto: {
    color: color.danger,
    ...type.body,
  },
  erroCampo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  erroCampoTexto: {
    flex: 1,
    minWidth: 0,
    color: color.danger,
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
  ajudaBloco: {
    gap: 8,
  },
  ajudaLink: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  ajudaLinkTexto: {
    color: color.brand,
    ...type.body,
    fontWeight: '600',
  },
  ajudaPainel: {
    gap: 8,
    backgroundColor: color.sunken,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  ajudaTexto: {
    color: color.text,
    ...type.small,
  },
  demoTexto: {
    color: color.muted,
    ...type.small,
    fontWeight: '500',
  },
}));
