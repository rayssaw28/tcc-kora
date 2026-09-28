import { Linking, Platform } from 'react-native';

export async function baixarArquivo(_url: string, nomeArquivo: string): Promise<void> {
  const destino = `https://example.com/?arquivo=${encodeURIComponent(nomeArquivo)}`;
  if (Platform.OS === 'web') {
    window.open(destino, '_blank', 'noopener,noreferrer');
    return;
  }
  await Linking.openURL(destino);
}
