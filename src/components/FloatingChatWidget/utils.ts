// utils.ts
import { FALLBACK_RESPONSES } from './constants';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getRandomResponse = (): string => {
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
};

export const validateFile = (file: File, maxSize: number, allowedTypes: string[]): boolean => {
  if (file.size > maxSize) {
    return false;
  }
  
  if (allowedTypes.includes('*/*')) {
    return true;
  }
  
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const generateId = (): number => {
  return Date.now() + Math.random();
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const getPositionStyles = (
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
  };

  switch (position) {
    case 'bottom-left':
      return { ...baseStyles, bottom: '20px', left: '20px' };
    case 'top-right':
      return { ...baseStyles, top: '20px', right: '20px' };
    case 'top-left':
      return { ...baseStyles, top: '20px', left: '20px' };
    default:
      return { ...baseStyles, bottom: '20px', right: '20px' };
  }
};