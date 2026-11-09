import { Platform } from 'react-native';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

/** E-mail do RH exibido na ajuda de senha do login; sem ele, a tela mostra só a orientação. */
export const RH_CONTATO_EMAIL = process.env.EXPO_PUBLIC_RH_EMAIL?.trim() || null;

export const API_BASE_URL = configuredApiUrl || Platform.select({
  android: 'http://10.0.2.2:8080',
  default: 'http://localhost:8080',
})!;
