// =============================================================================
// Vector Architect — MMKV Storage Adapter for Zustand Persist
// Lazy-initialized to avoid crashes before native modules are ready.
// =============================================================================

import { createMMKV, type MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

let _mmkv: MMKV | null = null;

function getMMKV(): MMKV {
  if (!_mmkv) {
    _mmkv = createMMKV({ id: 'vector-architect-storage' });
  }
  return _mmkv;
}

/**
 * Zustand-compatible StateStorage backed by react-native-mmkv.
 * Provides synchronous, high-performance local persistence.
 */
export const mmkvStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const value = getMMKV().getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    getMMKV().set(name, value);
  },
  removeItem: (name: string): void => {
    getMMKV().remove(name);
  },
};
