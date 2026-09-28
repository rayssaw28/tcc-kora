import { Platform } from 'react-native';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_BASE_URL = configuredApiUrl || Platform.select({
  android: 'http://10.0.2.2:8080',
  default: 'http://localhost:8080',
})!;
