import { Injectable } from '@angular/core';

/**
 * SSR-safe sessionStorage wrapper for non-sensitive UI state only.
 * Auth tokens must NEVER be stored here — they live in AuthService memory.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private memoryStorage: Record<string, string> = {};

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && !!window.sessionStorage;
  }

  getItem(key: string): string | null {
    return this.isBrowser() ? sessionStorage.getItem(key) : (this.memoryStorage[key] ?? null);
  }

  setItem(key: string, value: string): void {
    if (this.isBrowser()) sessionStorage.setItem(key, value);
    else this.memoryStorage[key] = value;
  }

  removeItem(key: string): void {
    if (this.isBrowser()) sessionStorage.removeItem(key);
    else delete this.memoryStorage[key];
  }

  clear(): void {
    if (this.isBrowser()) sessionStorage.clear();
    else this.memoryStorage = {};
  }
}
