import { Platform } from 'react-native';

export function isDesktopWeb(width: number): boolean {
  return Platform.OS === 'web' && width >= 900;
}
