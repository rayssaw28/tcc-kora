import { api, saveToken, clearToken } from '@/api/client';
import { LoginResponse } from '@/api/types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TROCA_SENHA_OBRIGATORIA_KEY = 'conformia_troca_senha_obrigatoria';

export async function login(email: string, senha: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, senha });
  await saveToken(data.token);
  await salvarTrocaSenhaObrigatoria(data.trocaSenhaObrigatoria);
  return data;
}

export async function logout(): Promise<void> {
  await clearToken();
  await limparTrocaSenhaObrigatoria();
}

export async function getTrocaSenhaObrigatoria(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return window.localStorage.getItem(TROCA_SENHA_OBRIGATORIA_KEY) === 'true';
  }

  return (await SecureStore.getItemAsync(TROCA_SENHA_OBRIGATORIA_KEY)) === 'true';
}

export async function limparTrocaSenhaObrigatoria(): Promise<void> {
  if (Platform.OS === 'web') {
    window.localStorage.removeItem(TROCA_SENHA_OBRIGATORIA_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(TROCA_SENHA_OBRIGATORIA_KEY);
}

async function salvarTrocaSenhaObrigatoria(obrigatoria: boolean): Promise<void> {
  if (!obrigatoria) {
    await limparTrocaSenhaObrigatoria();
    return;
  }

  if (Platform.OS === 'web') {
    window.localStorage.setItem(TROCA_SENHA_OBRIGATORIA_KEY, 'true');
    return;
  }

  await SecureStore.setItemAsync(TROCA_SENHA_OBRIGATORIA_KEY, 'true');
}
